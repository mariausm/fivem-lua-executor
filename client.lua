-- ============================================================
--  LuaExecutor  |  client.lua
--  Opens/closes the NUI panel, executes code client-side.
-- ============================================================

local nuiOpen       = false
local lastHeartbeat = 0
local accessGranted = false  -- cached after first server permission check

-- ── Inspect helper ────────────────────────────────────────────
local function inspect(val, depth)
    depth = depth or 0
    if depth > 3 then return '...' end
    local t = type(val)
    if t == 'table' then
        local parts, n = {}, 0
        for k, v in pairs(val) do
            n = n + 1
            if n > 24 then table.insert(parts, '  ...'); break end
            local key = type(k) == 'string' and k or ('[' .. tostring(k) .. ']')
            table.insert(parts, string.rep('  ', depth + 1) .. key .. ' = ' .. inspect(v, depth + 1))
        end
        if #parts == 0 then return '{}' end
        return '{\n' .. table.concat(parts, ',\n') .. '\n' .. string.rep('  ', depth) .. '}'
    elseif t == 'string' then
        return '"' .. val:gsub('"', '\\"'):gsub('\n', '\\n') .. '"'
    else
        return tostring(val)
    end
end

-- ── Panel open / close ────────────────────────────────────────
local function openExecutor()
    if nuiOpen then return end
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'open' })
    nuiOpen = true
    lastHeartbeat = GetGameTimer()
end

local function closeExecutor()
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
    nuiOpen = false
end

-- Watchdog: releases NUI focus if heartbeats stop (panel closed without callback).
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(500)
        if nuiOpen and (GetGameTimer() - lastHeartbeat) > 2500 then
            SetNuiFocus(false, false)
            nuiOpen = false
        end
    end
end)

-- ── Permission check ──────────────────────────────────────────
local function checkAndOpen()
    if accessGranted then
        openExecutor()
        return
    end

    lib.callback('luaexecutor:checkAccess', false, function(allowed)
        if allowed then
            accessGranted = true
            openExecutor()
        else
            if Config.NotifyOnDeny then
                lib.notify({ description = Config.DenyMessage, type = 'error' })
            end
        end
    end)
end

-- ── Commands ──────────────────────────────────────────────────
-- ACE mode: FiveM enforces the restriction itself via the third parameter.
-- Whitelist / open mode: restriction is always false; server validates on execute.
local cmdRestricted = Config.PermMode == 'ace'

RegisterCommand(Config.Command, function()
    if nuiOpen then closeExecutor() else checkAndOpen() end
end, cmdRestricted)

-- Default key binding; player can rebind in GTA V key settings.
RegisterKeyMapping(Config.Command, 'Toggle Lua Executor', 'keyboard', Config.Key)

-- Emergency command: force-releases NUI focus if controls get stuck.
RegisterCommand('execreset', function()
    SetNuiFocus(false, false)
    nuiOpen = false
    accessGranted = false
end, cmdRestricted)

-- ── NUI callbacks ─────────────────────────────────────────────

RegisterNUICallback('execute', function(data, cb)
    local code = data.code
    if not code or code == '' then
        cb({ result = 'No code provided.', isError = true })
        return
    end

    local captured = {}

    -- Sandboxed environment: custom print capture, full access to client globals.
    local env = setmetatable({
        print = function(...)
            local parts = {}
            for i = 1, select('#', ...) do
                parts[i] = tostring(select(i, ...))
            end
            table.insert(captured, table.concat(parts, '\t'))
        end,
        inspect = inspect,
    }, { __index = _G })

    local fn, compileErr = load(code, '=[LuaExecutor]', 't', env)
    if not fn then
        cb({ result = 'Compile Error\n' .. tostring(compileErr), isError = true })
        return
    end

    local rawResults = table.pack(pcall(fn))
    local ok = rawResults[1]

    if not ok then
        cb({ result = 'Runtime Error\n' .. tostring(rawResults[2]), isError = true })
        return
    end

    local lines = {}
    for _, l in ipairs(captured) do
        table.insert(lines, l)
    end

    if rawResults.n > 1 then
        local retParts = {}
        for i = 2, rawResults.n do
            table.insert(retParts, inspect(rawResults[i]))
        end
        table.insert(lines, '-> ' .. table.concat(retParts, ',  '))
    end

    local output = #lines > 0 and table.concat(lines, '\n') or 'Executed successfully (no output)'
    cb({ result = output, isError = false })
end)

RegisterNUICallback('heartbeat', function(_, cb)
    lastHeartbeat = GetGameTimer()
    cb({ ok = true })
end)

-- NUI already hid itself — only release focus, do NOT echo SendNUIMessage
-- back to avoid a race condition that would close a freshly re-opened panel.
RegisterNUICallback('close', function(_, cb)
    SetNuiFocus(false, false)
    nuiOpen = false
    cb({ status = 'ok' })
end)

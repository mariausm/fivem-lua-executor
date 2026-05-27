-- ============================================================
--  LuaExecutor  |  server.lua
--  Permission check and optional server-side execution.
-- ============================================================

-- ── Permission check ──────────────────────────────────────────
local function isAllowed(src)
    local mode = Config.PermMode

    if mode == 'open' then
        return true
    end

    if mode == 'ace' then
        return IsPlayerAceAllowed(src, Config.AcePerm)
    end

    -- Whitelist mode: compare all player identifiers against the config list.
    if mode == 'whitelist' then
        for i = 0, GetNumPlayerIdentifiers(src) - 1 do
            local ident = GetPlayerIdentifier(src, i)
            for _, allowed in ipairs(Config.Whitelist) do
                if ident == allowed then return true end
            end
        end
        return false
    end

    return false
end

-- Callback used by client.lua to verify access before opening the panel.
lib.callback.register('luaexecutor:checkAccess', function(src)
    local allowed = isAllowed(src)
    if not allowed and Config.ServerLog then
        print(('[LuaExecutor] Access denied — %s (ID: %s)'):format(GetPlayerName(src), src))
    end
    return allowed
end)

-- ── Helpers ───────────────────────────────────────────────────
local function inspect(val, depth)
    depth = depth or 0
    if depth > 4 then return '...' end
    local t = type(val)
    if t == 'table' then
        local parts, n = {}, 0
        for k, v in pairs(val) do
            n = n + 1
            if n > 32 then
                table.insert(parts, '  ... (' .. (n - 32) .. '+ more)')
                break
            end
            local key = type(k) == 'string' and k or ('[' .. tostring(k) .. ']')
            local pad = string.rep('  ', depth + 1)
            table.insert(parts, pad .. key .. ' = ' .. inspect(v, depth + 1))
        end
        if #parts == 0 then return '{}' end
        return '{\n' .. table.concat(parts, ',\n') .. '\n' .. string.rep('  ', depth) .. '}'
    elseif t == 'string' then
        return '"' .. val:gsub('\\', '\\\\'):gsub('"', '\\"'):gsub('\n', '\\n') .. '"'
    else
        return tostring(val)
    end
end

local function buildOutput(captured, returnValues)
    local lines = {}

    for _, line in ipairs(captured) do
        table.insert(lines, line)
    end

    if returnValues.n > 0 then
        local retParts = {}
        for i = 1, returnValues.n do
            table.insert(retParts, inspect(returnValues[i]))
        end
        table.insert(lines, '-> ' .. table.concat(retParts, ',  '))
    end

    if #lines == 0 then
        return 'Executed successfully (no output)', false
    end

    return table.concat(lines, '\n'), false
end

-- ── Server-side execution (optional, triggered from client) ───

RegisterNetEvent('luaexecutor:execute')
AddEventHandler('luaexecutor:execute', function(code, execId)
    local src = source

    if not isAllowed(src) then
        TriggerClientEvent('luaexecutor:result', src,
            'Access Denied\n' .. Config.DenyMessage,
            true, execId)
        return
    end

    local playerName = GetPlayerName(src) or 'Unknown'

    if Config.ServerLog then
        print(('[LuaExecutor] %s (ID: %s) executing...'):format(playerName, src))
    end

    local captured = {}

    -- Sandboxed environment: custom print, full access to server globals.
    local env = setmetatable({
        print = function(...)
            local parts = {}
            for i = 1, select('#', ...) do
                parts[i] = tostring(select(i, ...))
            end
            local line = table.concat(parts, '\t')
            table.insert(captured, line)
            print('[LuaExecutor] ' .. line)
        end
    }, { __index = _G })

    local fn, compileErr = load(code, '=[LuaExecutor]', 't', env)

    if not fn then
        TriggerClientEvent('luaexecutor:result', src,
            'Compile Error\n' .. tostring(compileErr),
            true, execId)
        return
    end

    local rawResults = table.pack(pcall(fn))
    local ok = rawResults[1]

    if not ok then
        TriggerClientEvent('luaexecutor:result', src,
            'Runtime Error\n' .. tostring(rawResults[2]),
            true, execId)

        if Config.ServerLog then
            print(('[LuaExecutor] Runtime error from %s: %s'):format(playerName, tostring(rawResults[2])))
        end
        return
    end

    local returnValues = { n = rawResults.n - 1 }
    for i = 2, rawResults.n do
        returnValues[i - 1] = rawResults[i]
    end

    local output, isErr = buildOutput(captured, returnValues)

    TriggerClientEvent('luaexecutor:result', src, output, isErr, execId)

    if Config.ServerLog then
        print(('[LuaExecutor] Done — %s'):format(playerName))
    end
end)

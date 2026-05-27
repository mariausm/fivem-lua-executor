-- ============================================================
--  LuaExecutor  |  config.lua
-- ============================================================

Config = {}

-- Toggle key for the executor panel.
-- Common values: 'F5' 'F6' 'F7' 'F8' 'F9' 'INSERT' 'HOME' 'END'
--                'NUMPAD0' ... 'NUMPAD9' 'LBRACKET' 'RBRACKET'
-- Players can rebind via: ESC > Settings > Key Bindings > "Toggle Lua Executor"
Config.Key = 'F7'

-- Chat command name (without /).
-- Do NOT use 'exec' — it is a reserved FiveM built-in command.
Config.Command = 'luaexec'

-- Permission mode.
-- 'ace'       : checks server.cfg ACE rule (Config.AcePerm)
-- 'whitelist' : checks Config.Whitelist identifiers (no server.cfg changes needed)
-- 'open'      : everyone can access — for local testing only, never use on production
Config.PermMode = 'whitelist'

-- Player identifiers allowed to use the executor.
-- Only used when Config.PermMode = 'whitelist'.
-- Supported prefixes: license:  license2:  steam:  discord:  ip:
Config.Whitelist = {
    'license:cba89950dfe24d9660f21c5f905edfb6ddc132d0',
    'license2:cba89950dfe24d9660f21c5f905edfb6ddc132d0',
    -- 'steam:11000010XXXXXXXX',
    -- 'discord:XXXXXXXXXXXXXXXXXX',
}

-- ACE permission node used when Config.PermMode = 'ace'.
-- server.cfg: add_ace group.admin luaexecutor.allow allow
Config.AcePerm = 'luaexecutor.allow'

-- Show a notification when access is denied.
Config.NotifyOnDeny = true

-- Notification message shown when access is denied.
Config.DenyMessage = 'You do not have permission to use Lua Executor.'

-- Print execution info to the server console.
Config.ServerLog = true

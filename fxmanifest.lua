fx_version 'cerulean'
game 'gta5'

name 'LuaExecutor'
description 'Professional FiveM Lua Executor - Development Tool'
author 'Admin'
version '1.0.0'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua',
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/assets/*.js',
    'html/assets/*.css',
}

client_scripts {
    'client.lua'
}

server_scripts {
    'server.lua'
}

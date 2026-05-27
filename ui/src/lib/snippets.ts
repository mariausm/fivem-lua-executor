export interface Snippet {
  key: string
  name: string
  desc: string
  code: string
}

export const SNIPPETS: Snippet[] = [
  {
    key: 'coords',
    name: 'My Coordinates',
    desc: 'XYZ + heading',
    code: `local ped    = PlayerPedId()
local coords = GetEntityCoords(ped)
local head   = GetEntityHeading(ped)
print(string.format("X: %.4f", coords.x))
print(string.format("Y: %.4f", coords.y))
print(string.format("Z: %.4f", coords.z))
print(string.format("H: %.2f",  head))`,
  },
  {
    key: 'playerinfo',
    name: 'My Player Info',
    desc: 'Health, armour, wanted',
    code: `local pid = PlayerId()
local ped = PlayerPedId()
print("Name    : " .. GetPlayerName(pid))
print("Health  : " .. GetEntityHealth(ped) .. " / 200")
print("Armour  : " .. GetPedArmour(ped))
print("Wanted  : " .. GetPlayerWantedLevel(pid))
print("Dead?   : " .. tostring(IsEntityDead(ped)))`,
  },
  {
    key: 'vehicle',
    name: 'Vehicle Info',
    desc: 'Speed, health, plate',
    code: `local ped = PlayerPedId()
local veh = GetVehiclePedIsIn(ped, false)
if veh == 0 then print("Not in a vehicle.") return end
print("Speed   : " .. string.format("%.1f km/h", GetEntitySpeed(veh) * 3.6))
print("Health  : " .. GetEntityHealth(veh))
print("Engine  : " .. GetVehicleEngineHealth(veh))
print("Fuel    : " .. string.format("%.1f%%", GetVehicleFuelLevel(veh)))
print("Plate   : " .. GetVehicleNumberPlateText(veh))`,
  },
  {
    key: 'players',
    name: 'Nearby Players',
    desc: 'List players + distance',
    code: `local myPos = GetEntityCoords(PlayerPedId())
for _, pid in ipairs(GetActivePlayers()) do
    local ped  = GetPlayerPed(pid)
    local pos  = GetEntityCoords(ped)
    local dist = #(myPos - pos)
    if dist < 100.0 then
        print(string.format("[%d] %s — %.1f m", pid, GetPlayerName(pid), dist))
    end
end`,
  },
  {
    key: 'resources',
    name: 'List Resources',
    desc: 'All started resources',
    code: `local total, started = GetNumResources(), 0
for i = 0, total - 1 do
    local name = GetResourceByFindIndex(i)
    if GetResourceState(name) == "started" then
        started = started + 1
        print("  [✓] " .. name)
    end
end
print("\\nStarted: " .. started .. " / " .. total)`,
  },
  {
    key: 'trigger_server',
    name: 'Trigger Server Event',
    desc: 'Send event to server',
    code: `TriggerServerEvent("myEvent:test", {
    data = "Hello from LuaExecutor!"
})
print("Server event sent")`,
  },
  {
    key: 'teleport',
    name: 'Teleport to Coords',
    desc: 'Set entity coords',
    code: `local x, y, z = 202.4, -933.5, 30.7  -- LSPD
local ped = PlayerPedId()
SetEntityCoords(ped, x, y, z, false, false, false, false)
print("Teleported to " .. x .. ", " .. y .. ", " .. z)`,
  },
  {
    key: 'inspect',
    name: 'Inspect Table',
    desc: 'Pretty-print with inspect()',
    code: `local data = {
    name   = GetPlayerName(PlayerId()),
    coords = GetEntityCoords(PlayerPedId()),
    health = GetEntityHealth(PlayerPedId()),
}
print(inspect(data))`,
  },
]

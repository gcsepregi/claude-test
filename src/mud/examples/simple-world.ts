/**
 * Simple example world for the MUD engine
 */

import { MudWorld } from '../MudWorld';

/**
 * Create a simple example world with a few rooms and items
 */
export function createSimpleWorld(): { world: MudWorld; playerId: string } {
  const world = new MudWorld();

  // Create rooms
  const entranceId = world.createRoom(
    'Entrance Hall',
    'You stand in a grand entrance hall with marble floors and high ceilings. ' +
    'Dust motes dance in the sunlight streaming through tall windows. ' +
    'A large wooden door stands to the north, and a narrow corridor leads east.'
  );

  const libraryId = world.createRoom(
    'Ancient Library',
    'Towering bookshelves line the walls of this musty library. The air smells of old paper and leather. ' +
    'Most of the books appear to be ancient and fragile. A reading desk sits in the center of the room.'
  );

  const gardenId = world.createRoom(
    'Overgrown Garden',
    'What was once a manicured garden is now a wild tangle of plants and flowers. ' +
    'A stone fountain stands silent in the center, its basin dry and cracked. ' +
    'The path leads back west to the entrance hall, and a set of stairs leads down into darkness.'
  );

  const cellarsId = world.createRoom(
    'Dark Cellar',
    'The damp cellar is dark and cold. The walls are made of rough stone, and the floor is packed earth. ' +
    'You can hear water dripping somewhere in the darkness. Wooden stairs lead back up to the garden.'
  );

  // Connect rooms
  world.connectRooms(entranceId, 'north', libraryId);
  world.connectRooms(libraryId, 'south', entranceId);

  world.connectRooms(entranceId, 'east', gardenId);
  world.connectRooms(gardenId, 'west', entranceId);

  world.connectRooms(gardenId, 'down', cellarsId);
  world.connectRooms(cellarsId, 'up', gardenId);

  // Create items
  const keyId = world.createItem(
    'rusty key',
    'A small, rusty key with an ornate handle. It looks quite old.',
    true
  );

  const bookId = world.createItem(
    'ancient tome',
    'A heavy leather-bound book with gold lettering on its spine. The title reads "Mysteries of the Old World".',
    true
  );

  const lampId = world.createItem(
    'oil lamp',
    'A brass oil lamp with a glass chimney. It appears to still have some oil in it.',
    true
  );

  const fountainId = world.createItem(
    'stone fountain',
    'A large stone fountain carved with images of mythical creatures. It is far too heavy to move.',
    false
  );

  const deskId = world.createItem(
    'reading desk',
    'A sturdy oak desk with a leather writing surface. It looks like it has been here for centuries.',
    false
  );

  // Place items in rooms
  world.placeItem(keyId, cellarsId);
  world.placeItem(bookId, libraryId);
  world.placeItem(lampId, entranceId);
  world.placeItem(fountainId, gardenId);
  world.placeItem(deskId, libraryId);

  // Create a player
  const playerId = world.createPlayer('Adventurer', entranceId);

  return { world, playerId };
}

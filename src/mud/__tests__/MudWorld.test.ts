/**
 * Tests for MudWorld
 */

import { MudWorld } from '../MudWorld';

describe('MudWorld', () => {
  let world: MudWorld;

  beforeEach(() => {
    world = new MudWorld();
  });

  describe('Room management', () => {
    test('should create a room with name and description', () => {
      const roomId = world.createRoom('Test Room', 'A test room description');

      expect(world.getRoomName(roomId)).toBe('Test Room');
      expect(world.getRoomDescription(roomId)).toBe('A test room description');
    });

    test('should connect rooms with exits', () => {
      const room1 = world.createRoom('Room 1', 'First room');
      const room2 = world.createRoom('Room 2', 'Second room');

      world.connectRooms(room1, 'north', room2);

      const exits = world.getRoomExits(room1);
      expect(exits.get('north')).toBe(room2);
    });

    test('should support bidirectional room connections', () => {
      const room1 = world.createRoom('Room 1', 'First room');
      const room2 = world.createRoom('Room 2', 'Second room');

      world.connectRooms(room1, 'north', room2);
      world.connectRooms(room2, 'south', room1);

      const exits1 = world.getRoomExits(room1);
      const exits2 = world.getRoomExits(room2);

      expect(exits1.get('north')).toBe(room2);
      expect(exits2.get('south')).toBe(room1);
    });

    test('should return empty map for room with no exits', () => {
      const room = world.createRoom('Isolated Room', 'A room with no exits');
      const exits = world.getRoomExits(room);

      expect(exits.size).toBe(0);
    });
  });

  describe('Item management', () => {
    test('should create an item with properties', () => {
      const itemId = world.createItem('Test Item', 'A test item description', true);

      expect(world.getItemName(itemId)).toBe('Test Item');
      expect(world.getItemDescription(itemId)).toBe('A test item description');
      expect(world.isItemPortable(itemId)).toBe(true);
    });

    test('should create non-portable items', () => {
      const itemId = world.createItem('Heavy Rock', 'Too heavy to move', false);

      expect(world.isItemPortable(itemId)).toBe(false);
    });

    test('should place items in rooms', () => {
      const room = world.createRoom('Test Room', 'Description');
      const item = world.createItem('Test Item', 'Description', true);

      world.placeItem(item, room);

      const items = world.getRoomItems(room);
      expect(items).toContain(item);
    });

    test('should list all items in a room', () => {
      const room = world.createRoom('Test Room', 'Description');
      const item1 = world.createItem('Item 1', 'Description 1', true);
      const item2 = world.createItem('Item 2', 'Description 2', true);

      world.placeItem(item1, room);
      world.placeItem(item2, room);

      const items = world.getRoomItems(room);
      expect(items).toHaveLength(2);
      expect(items).toContain(item1);
      expect(items).toContain(item2);
    });
  });

  describe('Player management', () => {
    test('should create a player in a starting room', () => {
      const room = world.createRoom('Starting Room', 'Description');
      const playerId = world.createPlayer('Test Player', room);

      expect(world.getPlayerLocation(playerId)).toBe(room);
    });

    test('should move player to a new room', () => {
      const room1 = world.createRoom('Room 1', 'Description 1');
      const room2 = world.createRoom('Room 2', 'Description 2');
      const playerId = world.createPlayer('Test Player', room1);

      world.movePlayer(playerId, room2);

      expect(world.getPlayerLocation(playerId)).toBe(room2);
    });
  });

  describe('Inventory management', () => {
    test('should add items to player inventory', () => {
      const room = world.createRoom('Test Room', 'Description');
      const item = world.createItem('Test Item', 'Description', true);
      const playerId = world.createPlayer('Test Player', room);

      world.placeItem(item, room);
      world.addToInventory(playerId, item);

      const inventory = world.getPlayerInventory(playerId);
      expect(inventory).toContain(item);
    });

    test('should remove items from room when added to inventory', () => {
      const room = world.createRoom('Test Room', 'Description');
      const item = world.createItem('Test Item', 'Description', true);
      const playerId = world.createPlayer('Test Player', room);

      world.placeItem(item, room);
      world.addToInventory(playerId, item);

      const roomItems = world.getRoomItems(room);
      expect(roomItems).not.toContain(item);
    });

    test('should drop items from inventory to current room', () => {
      const room = world.createRoom('Test Room', 'Description');
      const item = world.createItem('Test Item', 'Description', true);
      const playerId = world.createPlayer('Test Player', room);

      world.addToInventory(playerId, item);
      world.dropItem(playerId, item);

      const inventory = world.getPlayerInventory(playerId);
      const roomItems = world.getRoomItems(room);

      expect(inventory).not.toContain(item);
      expect(roomItems).toContain(item);
    });

    test('should handle empty inventory', () => {
      const room = world.createRoom('Test Room', 'Description');
      const playerId = world.createPlayer('Test Player', room);

      const inventory = world.getPlayerInventory(playerId);
      expect(inventory).toHaveLength(0);
    });
  });

  describe('World export', () => {
    test('should export world as RDF Turtle format', async () => {
      const room = world.createRoom('Test Room', 'A test room');
      const item = world.createItem('Test Item', 'A test item', true);
      world.placeItem(item, room);

      const rdf = await world.exportWorld();

      expect(rdf).toContain('Test Room');
      expect(rdf).toContain('Test Item');
    });
  });
});

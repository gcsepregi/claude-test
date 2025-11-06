/**
 * Tests for CommandProcessor
 */

import { CommandProcessor } from '../CommandProcessor';
import { MudWorld } from '../MudWorld';

describe('CommandProcessor', () => {
  let world: MudWorld;
  let processor: CommandProcessor;
  let playerId: string;
  let room1Id: string;
  let room2Id: string;

  beforeEach(() => {
    world = new MudWorld();
    processor = new CommandProcessor();

    // Set up a simple test world
    room1Id = world.createRoom('Starting Room', 'You are in a starting room.');
    room2Id = world.createRoom('Next Room', 'You are in the next room.');

    world.connectRooms(room1Id, 'north', room2Id);
    world.connectRooms(room2Id, 'south', room1Id);

    playerId = world.createPlayer('Test Player', room1Id);
  });

  describe('Command parsing', () => {
    test('should handle empty input', () => {
      const result = processor.processCommand(world, playerId, '');
      expect(result.success).toBe(false);
      expect(result.message).toContain('enter a command');
    });

    test('should handle whitespace-only input', () => {
      const result = processor.processCommand(world, playerId, '   ');
      expect(result.success).toBe(false);
      expect(result.message).toContain('enter a command');
    });

    test('should handle unknown commands', () => {
      const result = processor.processCommand(world, playerId, 'dance');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown command');
    });
  });

  describe('LOOK command', () => {
    test('should describe the current room', () => {
      const result = processor.processCommand(world, playerId, 'look');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Starting Room');
      expect(result.message).toContain('You are in a starting room');
    });

    test('should list available exits', () => {
      const result = processor.processCommand(world, playerId, 'look');
      expect(result.success).toBe(true);
      expect(result.message).toContain('north');
    });

    test('should list items in the room', () => {
      const itemId = world.createItem('Test Item', 'A test item', true);
      world.placeItem(itemId, room1Id);

      const result = processor.processCommand(world, playerId, 'look');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Test Item');
    });

    test('should work with alias "l"', () => {
      const result = processor.processCommand(world, playerId, 'l');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Starting Room');
    });
  });

  describe('GO command', () => {
    test('should move player to another room', () => {
      const result = processor.processCommand(world, playerId, 'go north');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Next Room');
      expect(world.getPlayerLocation(playerId)).toBe(room2Id);
    });

    test('should work with direction as command', () => {
      const result = processor.processCommand(world, playerId, 'north');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Next Room');
    });

    test('should work with short direction aliases', () => {
      const result = processor.processCommand(world, playerId, 'n');
      expect(result.success).toBe(true);
      expect(world.getPlayerLocation(playerId)).toBe(room2Id);
    });

    test('should fail when direction has no exit', () => {
      const result = processor.processCommand(world, playerId, 'go east');
      expect(result.success).toBe(false);
      expect(result.message).toContain("can't go");
    });

    test('should fail without direction', () => {
      const result = processor.processCommand(world, playerId, 'go');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Go where');
    });
  });

  describe('TAKE command', () => {
    let itemId: string;

    beforeEach(() => {
      itemId = world.createItem('Test Item', 'A portable test item', true);
      world.placeItem(itemId, room1Id);
    });

    test('should pick up an item', () => {
      const result = processor.processCommand(world, playerId, 'take test item');
      expect(result.success).toBe(true);
      expect(result.message).toContain('take');

      const inventory = world.getPlayerInventory(playerId);
      expect(inventory).toContain(itemId);
    });

    test('should work with aliases "get" and "pickup"', () => {
      let result = processor.processCommand(world, playerId, 'get test item');
      expect(result.success).toBe(true);
    });

    test('should fail when item is not in room', () => {
      const result = processor.processCommand(world, playerId, 'take nonexistent');
      expect(result.success).toBe(false);
      expect(result.message).toContain('no');
    });

    test('should fail when item is not portable', () => {
      const heavyId = world.createItem('Heavy Rock', 'Too heavy', false);
      world.placeItem(heavyId, room1Id);

      const result = processor.processCommand(world, playerId, 'take heavy rock');
      expect(result.success).toBe(false);
      expect(result.message).toContain("can't take");
    });

    test('should fail without item name', () => {
      const result = processor.processCommand(world, playerId, 'take');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Take what');
    });
  });

  describe('DROP command', () => {
    let itemId: string;

    beforeEach(() => {
      itemId = world.createItem('Test Item', 'A portable test item', true);
      world.addToInventory(playerId, itemId);
    });

    test('should drop an item from inventory', () => {
      const result = processor.processCommand(world, playerId, 'drop test item');
      expect(result.success).toBe(true);
      expect(result.message).toContain('drop');

      const inventory = world.getPlayerInventory(playerId);
      expect(inventory).not.toContain(itemId);

      const roomItems = world.getRoomItems(room1Id);
      expect(roomItems).toContain(itemId);
    });

    test('should fail when item is not in inventory', () => {
      const result = processor.processCommand(world, playerId, 'drop nonexistent');
      expect(result.success).toBe(false);
      expect(result.message).toContain("don't have");
    });

    test('should fail without item name', () => {
      const result = processor.processCommand(world, playerId, 'drop');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Drop what');
    });
  });

  describe('INVENTORY command', () => {
    test('should show empty inventory', () => {
      const result = processor.processCommand(world, playerId, 'inventory');
      expect(result.success).toBe(true);
      expect(result.message).toContain('empty');
    });

    test('should list items in inventory', () => {
      const item1Id = world.createItem('Item 1', 'First item', true);
      const item2Id = world.createItem('Item 2', 'Second item', true);

      world.addToInventory(playerId, item1Id);
      world.addToInventory(playerId, item2Id);

      const result = processor.processCommand(world, playerId, 'inventory');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Item 1');
      expect(result.message).toContain('Item 2');
    });

    test('should work with aliases "inv" and "i"', () => {
      let result = processor.processCommand(world, playerId, 'inv');
      expect(result.success).toBe(true);

      result = processor.processCommand(world, playerId, 'i');
      expect(result.success).toBe(true);
    });
  });

  describe('HELP command', () => {
    test('should list available commands', () => {
      const result = processor.processCommand(world, playerId, 'help');
      expect(result.success).toBe(true);
      expect(result.message).toContain('look');
      expect(result.message).toContain('go');
      expect(result.message).toContain('take');
      expect(result.message).toContain('drop');
      expect(result.message).toContain('inventory');
    });

    test('should work with alias "?"', () => {
      const result = processor.processCommand(world, playerId, '?');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Available commands');
    });
  });
});

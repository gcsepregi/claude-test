/**
 * CommandProcessor - Handles user commands and game logic
 */

import { MudWorld } from './MudWorld';
import { ExitDirection } from './ontology';

/**
 * Result of executing a command
 */
export interface CommandResult {
  success: boolean;
  message: string;
}

/**
 * Interface for command implementations
 */
interface Command {
  name: string;
  aliases: string[];
  description: string;
  execute(world: MudWorld, playerId: string, args: string[]): CommandResult;
}

/**
 * CommandProcessor - Processes and executes player commands
 */
export class CommandProcessor {
  private commands: Map<string, Command>;

  constructor() {
    this.commands = new Map();
    this.registerDefaultCommands();
  }

  /**
   * Register all default commands
   */
  private registerDefaultCommands(): void {
    this.registerCommand(new LookCommand());

    const goCommand = new GoCommand();
    this.registerCommand(goCommand);

    // Register direction shortcuts
    const directions: Array<[string, ExitDirection]> = [
      ['n', 'north'],
      ['s', 'south'],
      ['e', 'east'],
      ['w', 'west'],
      ['u', 'up'],
      ['d', 'down'],
      ['north', 'north'],
      ['south', 'south'],
      ['east', 'east'],
      ['west', 'west'],
      ['up', 'up'],
      ['down', 'down'],
    ];

    for (const [alias, direction] of directions) {
      this.registerCommand(new DirectionCommand(alias, direction, goCommand));
    }

    this.registerCommand(new TakeCommand());
    this.registerCommand(new DropCommand());
    this.registerCommand(new InventoryCommand());
    this.registerCommand(new HelpCommand(this));
  }

  /**
   * Register a command
   */
  registerCommand(command: Command): void {
    this.commands.set(command.name.toLowerCase(), command);
    for (const alias of command.aliases) {
      this.commands.set(alias.toLowerCase(), command);
    }
  }

  /**
   * Get all registered commands
   */
  getCommands(): Command[] {
    const uniqueCommands = new Set<Command>();
    for (const command of this.commands.values()) {
      uniqueCommands.add(command);
    }
    return Array.from(uniqueCommands);
  }

  /**
   * Process a command string
   */
  processCommand(world: MudWorld, playerId: string, input: string): CommandResult {
    const trimmed = input.trim();
    if (!trimmed) {
      return { success: false, message: 'Please enter a command.' };
    }

    const parts = trimmed.split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const command = this.commands.get(commandName);
    if (!command) {
      return { success: false, message: `Unknown command: ${commandName}. Type 'help' for a list of commands.` };
    }

    return command.execute(world, playerId, args);
  }
}

/**
 * LOOK command - Describes the current room
 */
class LookCommand implements Command {
  name = 'look';
  aliases = ['l'];
  description = 'Look around the current room';

  execute(world: MudWorld, playerId: string, _args: string[]): CommandResult {
    const roomId = world.getPlayerLocation(playerId);
    if (!roomId) {
      return { success: false, message: 'You are nowhere!' };
    }

    const roomName = world.getRoomName(roomId);
    const roomDesc = world.getRoomDescription(roomId);
    const exits = world.getRoomExits(roomId);
    const items = world.getRoomItems(roomId);

    let message = `\n${roomName}\n${'='.repeat(roomName?.length || 0)}\n${roomDesc}\n`;

    // Show exits
    if (exits.size > 0) {
      const exitList = Array.from(exits.keys()).join(', ');
      message += `\nExits: ${exitList}`;
    } else {
      message += '\nThere are no obvious exits.';
    }

    // Show items
    if (items.length > 0) {
      message += '\n\nYou see:';
      for (const itemId of items) {
        const itemName = world.getItemName(itemId);
        message += `\n  - ${itemName}`;
      }
    }

    return { success: true, message };
  }
}

/**
 * GO command - Move in a direction
 */
class GoCommand implements Command {
  name = 'go';
  aliases: string[] = [];
  description = 'Move in a direction (go <direction>)';

  execute(world: MudWorld, playerId: string, args: string[]): CommandResult {
    const currentRoomId = world.getPlayerLocation(playerId);
    if (!currentRoomId) {
      return { success: false, message: 'You are nowhere!' };
    }

    if (args.length === 0) {
      return { success: false, message: 'Go where? Please specify a direction (north, south, east, west, up, down).' };
    }

    const direction = args[0].toLowerCase();

    // Map short forms to full directions
    const directionMap: Record<string, ExitDirection> = {
      'n': 'north',
      's': 'south',
      'e': 'east',
      'w': 'west',
      'u': 'up',
      'd': 'down',
      'north': 'north',
      'south': 'south',
      'east': 'east',
      'west': 'west',
      'up': 'up',
      'down': 'down',
    };

    const fullDirection = directionMap[direction];
    if (!fullDirection) {
      return { success: false, message: `Invalid direction: ${direction}. Use north, south, east, west, up, or down.` };
    }

    return this.moveInDirection(world, playerId, fullDirection);
  }

  /**
   * Move player in the specified direction
   */
  moveInDirection(world: MudWorld, playerId: string, direction: ExitDirection): CommandResult {
    const currentRoomId = world.getPlayerLocation(playerId);
    if (!currentRoomId) {
      return { success: false, message: 'You are nowhere!' };
    }

    const exits = world.getRoomExits(currentRoomId);
    const targetRoomId = exits.get(direction);

    if (!targetRoomId) {
      return { success: false, message: `You can't go ${direction} from here.` };
    }

    world.movePlayer(playerId, targetRoomId);

    // Automatically look at the new room
    const lookCommand = new LookCommand();
    const lookResult = lookCommand.execute(world, playerId, []);

    return { success: true, message: `You go ${direction}.\n${lookResult.message}` };
  }
}

/**
 * Direction shortcut command - Delegates to GoCommand
 */
class DirectionCommand implements Command {
  aliases: string[] = [];

  constructor(
    public name: string,
    private direction: ExitDirection,
    private goCommand: GoCommand
  ) {}

  get description(): string {
    return `Move ${this.direction}`;
  }

  execute(world: MudWorld, playerId: string, _args: string[]): CommandResult {
    return this.goCommand.moveInDirection(world, playerId, this.direction);
  }
}

/**
 * TAKE command - Pick up an item
 */
class TakeCommand implements Command {
  name = 'take';
  aliases = ['get', 'pickup'];
  description = 'Pick up an item (take <item>)';

  execute(world: MudWorld, playerId: string, args: string[]): CommandResult {
    if (args.length === 0) {
      return { success: false, message: 'Take what? Please specify an item.' };
    }

    const itemNameSearch = args.join(' ').toLowerCase();
    const roomId = world.getPlayerLocation(playerId);
    if (!roomId) {
      return { success: false, message: 'You are nowhere!' };
    }

    const items = world.getRoomItems(roomId);
    let foundItemId: string | null = null;

    for (const itemId of items) {
      const itemName = world.getItemName(itemId);
      if (itemName?.toLowerCase().includes(itemNameSearch)) {
        foundItemId = itemId;
        break;
      }
    }

    if (!foundItemId) {
      return { success: false, message: `There is no "${args.join(' ')}" here.` };
    }

    if (!world.isItemPortable(foundItemId)) {
      return { success: false, message: `You can't take that.` };
    }

    const itemName = world.getItemName(foundItemId);
    world.addToInventory(playerId, foundItemId);

    return { success: true, message: `You take the ${itemName}.` };
  }
}

/**
 * DROP command - Drop an item from inventory
 */
class DropCommand implements Command {
  name = 'drop';
  aliases = [];
  description = 'Drop an item from your inventory (drop <item>)';

  execute(world: MudWorld, playerId: string, args: string[]): CommandResult {
    if (args.length === 0) {
      return { success: false, message: 'Drop what? Please specify an item.' };
    }

    const itemNameSearch = args.join(' ').toLowerCase();
    const inventory = world.getPlayerInventory(playerId);
    let foundItemId: string | null = null;

    for (const itemId of inventory) {
      const itemName = world.getItemName(itemId);
      if (itemName?.toLowerCase().includes(itemNameSearch)) {
        foundItemId = itemId;
        break;
      }
    }

    if (!foundItemId) {
      return { success: false, message: `You don't have "${args.join(' ')}" in your inventory.` };
    }

    const itemName = world.getItemName(foundItemId);
    world.dropItem(playerId, foundItemId);

    return { success: true, message: `You drop the ${itemName}.` };
  }
}

/**
 * INVENTORY command - Show player's inventory
 */
class InventoryCommand implements Command {
  name = 'inventory';
  aliases = ['inv', 'i'];
  description = 'Show your inventory';

  execute(world: MudWorld, playerId: string, _args: string[]): CommandResult {
    const inventory = world.getPlayerInventory(playerId);

    if (inventory.length === 0) {
      return { success: true, message: 'Your inventory is empty.' };
    }

    let message = 'You are carrying:';
    for (const itemId of inventory) {
      const itemName = world.getItemName(itemId);
      message += `\n  - ${itemName}`;
    }

    return { success: true, message };
  }
}

/**
 * HELP command - List available commands
 */
class HelpCommand implements Command {
  name = 'help';
  aliases = ['?', 'commands'];
  description = 'Show this help message';

  constructor(private processor: CommandProcessor) {}

  execute(_world: MudWorld, _playerId: string, _args: string[]): CommandResult {
    const commands = this.processor.getCommands();
    let message = 'Available commands:\n';

    for (const command of commands) {
      let line = `  ${command.name}`;
      if (command.aliases.length > 0) {
        line += ` (${command.aliases.join(', ')})`;
      }
      line += ` - ${command.description}`;
      message += line + '\n';
    }

    return { success: true, message };
  }
}

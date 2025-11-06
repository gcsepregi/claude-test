# MUD Engine

A simple Multi-User Dungeon (MUD) engine built on top of the RDF datastore. This engine demonstrates how semantic web technologies can be used to create flexible, queryable game worlds.

## Features

- **RDF-based world representation** - Game state stored as RDF triples
- **Flexible data model** - Easy to extend with custom properties and relationships
- **Command-based interface** - Classic MUD-style text commands
- **Queryable game state** - Use SPARQL-like queries on the underlying RDF store
- **Serializable worlds** - Export and import game worlds in RDF formats
- **Fully tested** - Comprehensive test coverage

## Architecture

The MUD engine consists of three main components:

### 1. Ontology (`ontology.ts`)

Defines the vocabulary for the game world:
- **Classes**: Room, Item, Player
- **Properties**: name, description, location, contains, portable
- **Directions**: north, south, east, west, up, down
- **Relations**: inventory, location

### 2. MudWorld (`MudWorld.ts`)

Manages the game world state using the RDF datastore:
- Create and manage rooms, items, and players
- Connect rooms with exits
- Handle inventory management
- Query world state
- Export world as RDF

### 3. CommandProcessor (`CommandProcessor.ts`)

Processes player commands:
- **look** - Describe current room
- **go <direction>** - Move between rooms
- **take <item>** - Pick up items
- **drop <item>** - Drop items
- **inventory** - Show carried items
- **help** - List available commands

## Quick Start

### Creating a Simple World

```typescript
import { MudWorld, CommandProcessor } from './mud';

// Create a new world
const world = new MudWorld();

// Create rooms
const entranceId = world.createRoom(
  'Entrance Hall',
  'A grand entrance with marble floors.'
);

const libraryId = world.createRoom(
  'Library',
  'Tall bookshelves line the walls.'
);

// Connect rooms
world.connectRooms(entranceId, 'north', libraryId);
world.connectRooms(libraryId, 'south', entranceId);

// Create items
const bookId = world.createItem(
  'ancient tome',
  'A heavy leather-bound book.',
  true // portable
);

world.placeItem(bookId, libraryId);

// Create player
const playerId = world.createPlayer('Adventurer', entranceId);

// Process commands
const processor = new CommandProcessor();
const result = processor.processCommand(world, playerId, 'look');
console.log(result.message);
```

### Running the Demo

A complete example world is provided in `examples/simple-world.ts`:

```bash
# Build the project
npm run build

# Run the demo
npx ts-node src/mud/examples/demo.ts
```

The demo creates an interactive command-line game with:
- 4 connected rooms (Entrance Hall, Library, Garden, Cellar)
- 5 items to interact with
- Full command support

## Game Commands

| Command | Aliases | Description |
|---------|---------|-------------|
| `look` | `l` | Examine the current room |
| `go <direction>` | `n`, `s`, `e`, `w`, `u`, `d` | Move in a direction |
| `take <item>` | `get`, `pickup` | Pick up an item |
| `drop <item>` | - | Drop an item |
| `inventory` | `inv`, `i` | Show your inventory |
| `help` | `?`, `commands` | List all commands |

## RDF Representation

The game world is stored as RDF triples. For example, a room with an item might be represented as:

```turtle
@prefix mud: <http://example.org/mud#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

<http://example.org/game/room-1>
  rdf:type mud:Room ;
  mud:name "Library" ;
  mud:description "Tall bookshelves line the walls." ;
  mud:contains <http://example.org/game/item-1> ;
  mud:north <http://example.org/game/room-2> .

<http://example.org/game/item-1>
  rdf:type mud:Item ;
  mud:name "ancient tome" ;
  mud:description "A heavy leather-bound book." ;
  mud:portable "true" ;
  mud:location <http://example.org/game/room-1> .
```

## Extending the Engine

### Adding Custom Commands

Implement the `Command` interface:

```typescript
class ExamineCommand implements Command {
  name = 'examine';
  aliases = ['x', 'ex'];
  description = 'Examine an item closely';

  execute(world: MudWorld, playerId: string, args: string[]): CommandResult {
    // Implementation
    return { success: true, message: 'You examine the item...' };
  }
}

// Register the command
processor.registerCommand(new ExamineCommand());
```

### Adding Custom Properties

Extend the ontology:

```typescript
import { createNamedNode } from '../utils';

const mudTerm = (name: string) =>
  createNamedNode(`http://example.org/mud#${name}`);

// Add new properties
const customVocab = {
  weight: mudTerm('weight'),
  value: mudTerm('value'),
  locked: mudTerm('locked'),
};

// Use in world
world.getStore().addTriple(
  itemNode,
  customVocab.weight,
  createIntegerLiteral(5)
);
```

### Querying the World

Access the underlying RDF store for complex queries:

```typescript
const store = world.getStore();

// Find all portable items
const portableItems = store.match({
  predicate: mudVocab.portable,
  object: createBooleanLiteral(true)
});

// Find all rooms connected to a specific room
const connectedRooms = store.match({
  subject: roomNode
});
```

## Design Philosophy

This MUD engine demonstrates several key concepts:

1. **Semantic Data** - Using RDF provides a flexible, extensible data model
2. **Queryability** - Game state can be queried using standard RDF tools
3. **Interoperability** - Worlds can be exported and shared in standard formats
4. **Simplicity** - Starting small with core features that can be extended

## Testing

Run the test suite:

```bash
npm test -- src/mud
```

Tests cover:
- Room creation and connections
- Item management and properties
- Player movement and inventory
- Command processing
- World serialization

## Future Enhancements

Potential extensions for the engine:

- **NPCs** - Add non-player characters with behaviors
- **Combat System** - Implement turn-based combat
- **Skills/Stats** - Add player attributes and progression
- **Quests** - Track objectives and rewards
- **Persistence** - Save/load game state from files
- **Multiplayer** - Support multiple simultaneous players
- **Scripting** - Add Lua or JavaScript scripting for game logic
- **Time System** - Day/night cycles and timed events

## Why RDF for a MUD?

Using RDF provides several advantages:

1. **Flexibility** - Easy to add new entity types and relationships
2. **Queryability** - Complex queries on game state
3. **Extensibility** - Third-party content can add new properties
4. **Interoperability** - Share worlds with other tools
5. **Semantic Richness** - Express complex relationships naturally
6. **Standards-based** - Use established semantic web technologies

## License

MIT

/**
 * Demo MUD game - Interactive command-line interface
 */

import * as readline from 'readline';
import { CommandProcessor } from '../CommandProcessor';
import { createSimpleWorld } from './simple-world';

/**
 * Main game loop
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Welcome to the RDF-Powered MUD Engine Demo!');
  console.log('='.repeat(60));
  console.log('\nThis is a simple text adventure game built on top of an RDF datastore.');
  console.log('Type "help" for a list of commands, or "quit" to exit.\n');

  const { world, playerId } = createSimpleWorld();
  const processor = new CommandProcessor();

  // Show initial room
  const initialLook = processor.processCommand(world, playerId, 'look');
  console.log(initialLook.message);

  // Set up readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n> ',
  });

  rl.prompt();

  rl.on('line', (line: string) => {
    const input = line.trim();

    if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
      console.log('\nThanks for playing! Goodbye.');
      rl.close();
      return;
    }

    if (input.toLowerCase() === 'export') {
      // Special command to see the RDF representation
      world.exportWorld().then(rdf => {
        console.log('\n--- RDF World State (Turtle format) ---');
        console.log(rdf);
        console.log('--- End of RDF ---');
        rl.prompt();
      });
      return;
    }

    if (input) {
      const result = processor.processCommand(world, playerId, input);
      console.log(result.message);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

// Run the game
if (require.main === module) {
  main().catch(console.error);
}

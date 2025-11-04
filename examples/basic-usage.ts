/**
 * Basic Usage Example
 *
 * This example demonstrates the basic features of the RDF Datastore library
 */

import {
  RDFDatastore,
  createNamedNode,
  createLiteral,
  createIntegerLiteral,
  vocab,
} from '../src';

async function main() {
  console.log('=== RDF Datastore Basic Usage Example ===\n');

  // Create a new datastore
  const store = new RDFDatastore();

  // Define some URIs
  const alice = createNamedNode('http://example.org/person/alice');
  const bob = createNamedNode('http://example.org/person/bob');
  const charlie = createNamedNode('http://example.org/person/charlie');

  // Add information about people
  console.log('1. Adding data to the store...');

  // Alice
  store.addTriple(alice, vocab.rdf('type'), vocab.foaf('Person'));
  store.addTriple(alice, vocab.foaf('name'), createLiteral('Alice'));
  store.addTriple(alice, vocab.foaf('age'), createIntegerLiteral(30));
  store.addTriple(alice, vocab.foaf('knows'), bob);
  store.addTriple(alice, vocab.foaf('knows'), charlie);

  // Bob
  store.addTriple(bob, vocab.rdf('type'), vocab.foaf('Person'));
  store.addTriple(bob, vocab.foaf('name'), createLiteral('Bob'));
  store.addTriple(bob, vocab.foaf('age'), createIntegerLiteral(25));
  store.addTriple(bob, vocab.foaf('knows'), alice);

  // Charlie
  store.addTriple(charlie, vocab.rdf('type'), vocab.foaf('Person'));
  store.addTriple(charlie, vocab.foaf('name'), createLiteral('Charlie'));
  store.addTriple(charlie, vocab.foaf('age'), createIntegerLiteral(35));

  console.log(`Added ${store.size()} triples to the store\n`);

  // Query the store
  console.log('2. Querying the store...');

  // Find all people
  const people = store.match({
    predicate: vocab.rdf('type'),
    object: vocab.foaf('Person'),
  });
  console.log(`Found ${people.length} people in the store`);

  // Get information about each person
  people.forEach((quad) => {
    const person = quad.subject;
    const names = store.getObjects(person, vocab.foaf('name'));
    const ages = store.getObjects(person, vocab.foaf('age'));

    console.log(`  - ${names[0]?.value} (age: ${ages[0]?.value})`);
  });

  console.log();

  // Find who Alice knows
  console.log('3. Finding relationships...');
  const aliceKnows = store.getObjects(alice, vocab.foaf('knows'));
  console.log(`Alice knows ${aliceKnows.length} people:`);

  aliceKnows.forEach((person) => {
    const names = store.getObjects(person, vocab.foaf('name'));
    console.log(`  - ${names[0]?.value}`);
  });

  console.log();

  // Get statistics
  console.log('4. Store statistics:');
  const stats = store.getStats();
  console.log(`  Total triples: ${stats.tripleCount}`);
  console.log(`  Unique subjects: ${stats.subjectCount}`);
  console.log(`  Unique predicates: ${stats.predicateCount}`);

  console.log();

  // Serialize to Turtle
  console.log('5. Serializing to Turtle format:');
  const turtle = await store.serialize({ format: 'turtle' });
  console.log(turtle);

  // Parse from Turtle
  console.log('6. Creating a new store from Turtle data...');
  const newStore = new RDFDatastore();
  await newStore.parseFromString(turtle, 'turtle');
  console.log(`New store has ${newStore.size()} triples\n`);

  // Remove some data
  console.log('7. Removing data...');
  store.removeMatches({ predicate: vocab.foaf('age') });
  console.log(`After removing age information: ${store.size()} triples remain\n`);

  console.log('=== Example Complete ===');
}

// Run the example
main().catch(console.error);

# RDF Datastore

A TypeScript library for handling RDF (Resource Description Framework) datastores with full type safety and modern JavaScript features.

## Features

- **Type-safe RDF operations** - Full TypeScript support with comprehensive type definitions
- **Multiple RDF formats** - Parse and serialize Turtle, N-Triples, N-Quads, and TriG formats
- **Pattern matching** - Powerful query capabilities with flexible pattern matching
- **Namespace support** - Built-in support for common RDF vocabularies (FOAF, Schema.org, Dublin Core, etc.)
- **Blank nodes** - Full support for blank nodes in RDF graphs
- **Graph support** - Handle named graphs and quads
- **Statistics** - Get insights about your RDF data
- **Utility functions** - Helper functions for creating typed literals and namespaced URIs

## Installation

```bash
npm install @your-org/rdf-datastore
```

## Quick Start

```typescript
import { RDFDatastore, createNamedNode, createLiteral, vocab } from '@your-org/rdf-datastore';

// Create a new datastore
const store = new RDFDatastore();

// Add some triples
const person = createNamedNode('http://example.org/person/alice');
const name = vocab.foaf('name');
const age = createNamedNode('http://example.org/ontology/age');

store.addTriple(person, name, createLiteral('Alice'));
store.addTriple(person, age, createIntegerLiteral(30));

// Query the data
const matches = store.match({ subject: person });
console.log(`Found ${matches.length} triples about Alice`);

// Get specific values
const names = store.getObjects(person, name);
console.log(`Name: ${names[0].value}`); // "Alice"
```

## Core API

### Creating a Datastore

```typescript
import { RDFDatastore } from '@your-org/rdf-datastore';

// Empty store
const store = new RDFDatastore();

// Store with initial quads
const store = new RDFDatastore(existingQuads);
```

### Adding Data

```typescript
import { createNamedNode, createLiteral } from '@your-org/rdf-datastore';

const subject = createNamedNode('http://example.org/subject');
const predicate = createNamedNode('http://example.org/predicate');
const object = createLiteral('value');

// Add a single triple
store.addTriple(subject, predicate, object);

// Add multiple quads at once
store.addQuads([quad1, quad2, quad3]);
```

### Querying Data

```typescript
// Match all triples with a specific subject
const matches = store.match({ subject: person });

// Match by predicate
const allNames = store.match({ predicate: vocab.foaf('name') });

// Get all objects for a subject-predicate pair
const names = store.getObjects(person, vocab.foaf('name'));

// Check if a triple exists
const exists = store.has(subject, predicate, object);
```

### Removing Data

```typescript
// Remove a specific triple
store.removeTriple(subject, predicate, object);

// Remove all matching triples
store.removeMatches({ predicate: vocab.foaf('name') });

// Clear everything
store.clear();
```

### Working with Typed Literals

```typescript
import {
  createIntegerLiteral,
  createDecimalLiteral,
  createBooleanLiteral,
  createDateLiteral,
  createDateTimeLiteral,
} from '@your-org/rdf-datastore';

store.addTriple(person, vocab.foaf('age'), createIntegerLiteral(30));
store.addTriple(person, vocab.schema('rating'), createDecimalLiteral(4.5));
store.addTriple(person, vocab.schema('isActive'), createBooleanLiteral(true));
store.addTriple(person, vocab.schema('birthDate'), createDateLiteral(new Date('1990-01-15')));
```

### Using Namespaces

```typescript
import { vocab, namespaces, ns } from '@your-org/rdf-datastore';

// Built-in vocabulary helpers
const rdfType = vocab.rdf('type');
const foafName = vocab.foaf('name');
const schemaName = vocab.schema('name');

// Create custom namespaced URIs
const myPredicate = ns('http://example.org/ontology/', 'customPredicate');

// Available namespaces
// - rdf, rdfs, xsd, owl, skos
// - dc (Dublin Core), dcterms
// - foaf (Friend of a Friend)
// - schema (Schema.org)
```

### Parsing and Serialization

```typescript
// Parse RDF from string
const turtle = `
  @prefix foaf: <http://xmlns.com/foaf/0.1/> .
  <http://example.org/person> foaf:name "Alice" .
`;
await store.parseFromString(turtle, 'turtle');

// Serialize to string
const output = await store.serialize({
  format: 'turtle',
  prefixes: {
    ex: 'http://example.org/',
    foaf: 'http://xmlns.com/foaf/0.1/'
  }
});
```

### Statistics

```typescript
const stats = store.getStats();
console.log(`Triples: ${stats.tripleCount}`);
console.log(`Subjects: ${stats.subjectCount}`);
console.log(`Predicates: ${stats.predicateCount}`);
console.log(`Graphs: ${stats.graphCount}`);

// Get size
console.log(`Total triples: ${store.size()}`);

// Get all subjects or predicates
const subjects = store.getSubjects();
const predicates = store.getPredicates();
```

### Working with Named Graphs

```typescript
const graph = createNamedNode('http://example.org/graph1');

// Add to a named graph
store.addTriple(subject, predicate, object, graph);

// Query within a graph
const matches = store.match({ graph });

// Remove from a graph
store.removeTriple(subject, predicate, object, graph);
```

## Advanced Usage

### Custom Prefixes

```typescript
store.setPrefix('ex', 'http://example.org/');
store.setPrefix('myont', 'http://myontology.org/');

const prefixes = store.getPrefixes();
```

### Export and Import

```typescript
// Export all quads
const quads = store.exportQuads();

// Create a new store from exported quads
const newStore = new RDFDatastore(quads);
```

### Access Underlying N3 Store

```typescript
const n3Store = store.getStore();
// Use N3 store directly if needed
```

## Example: Building a Knowledge Graph

```typescript
import { RDFDatastore, createNamedNode, createLiteral, vocab } from '@your-org/rdf-datastore';

const store = new RDFDatastore();

// Define some people
const alice = createNamedNode('http://example.org/person/alice');
const bob = createNamedNode('http://example.org/person/bob');

// Add information about Alice
store.addTriple(alice, vocab.rdf('type'), vocab.foaf('Person'));
store.addTriple(alice, vocab.foaf('name'), createLiteral('Alice'));
store.addTriple(alice, vocab.foaf('mbox'), createNamedNode('mailto:alice@example.org'));
store.addTriple(alice, vocab.foaf('knows'), bob);

// Add information about Bob
store.addTriple(bob, vocab.rdf('type'), vocab.foaf('Person'));
store.addTriple(bob, vocab.foaf('name'), createLiteral('Bob'));

// Query all people
const people = store.match({
  predicate: vocab.rdf('type'),
  object: vocab.foaf('Person')
});
console.log(`Found ${people.length} people`);

// Find who Alice knows
const aliceKnows = store.getObjects(alice, vocab.foaf('knows'));
aliceKnows.forEach(person => {
  const names = store.getObjects(person, vocab.foaf('name'));
  console.log(`Alice knows ${names[0].value}`);
});
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint
npm run lint

# Format code
npm run format
```

## Built With

- [N3.js](https://github.com/rdfjs/N3.js) - Fast and lightweight RDF library
- [TypeScript](https://www.typescriptlang.org/) - Type safety and modern JavaScript
- [Jest](https://jestjs.io/) - Testing framework

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

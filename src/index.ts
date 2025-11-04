/**
 * RDF Datastore Library
 *
 * A TypeScript library for handling RDF datastores with support for:
 * - Creating and managing RDF triples/quads
 * - Querying RDF data with pattern matching
 * - Parsing and serializing RDF in multiple formats
 * - Common RDF utilities and helpers
 */

export { RDFDatastore } from './RDFDatastore';
export * from './types';
export * from './utils';

// Re-export commonly used N3 exports for convenience
export { DataFactory } from 'n3';

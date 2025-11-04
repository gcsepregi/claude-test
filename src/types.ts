import { Quad, NamedNode, BlankNode, Literal, Term } from 'n3';

/**
 * Represents a subject in an RDF triple (either a NamedNode or BlankNode)
 */
export type Subject = NamedNode | BlankNode;

/**
 * Represents a predicate in an RDF triple (NamedNode)
 */
export type Predicate = NamedNode;

/**
 * Represents an object in an RDF triple (NamedNode, BlankNode, or Literal)
 */
export type Object = NamedNode | BlankNode | Literal;

/**
 * Represents a graph identifier
 */
export type Graph = NamedNode | BlankNode | null;

/**
 * Query pattern for matching triples
 */
export interface QueryPattern {
  subject?: Subject | null;
  predicate?: Predicate | null;
  object?: Object | null;
  graph?: Graph;
}

/**
 * Statistics about the datastore
 */
export interface DatastoreStats {
  tripleCount: number;
  subjectCount: number;
  predicateCount: number;
  graphCount: number;
}

/**
 * Options for serialization
 */
export interface SerializationOptions {
  format?: 'turtle' | 'n-triples' | 'n-quads' | 'trig';
  prefixes?: Record<string, string>;
}

export { Quad, NamedNode, BlankNode, Literal, Term };

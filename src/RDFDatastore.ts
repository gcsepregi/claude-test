import { Store, Parser, Writer, DataFactory, Quad } from 'n3';
import {
  Subject,
  Predicate,
  Object,
  Graph,
  QueryPattern,
  DatastoreStats,
  SerializationOptions,
} from './types';

const { quad } = DataFactory;

/**
 * RDFDatastore - A TypeScript wrapper around N3.js for managing RDF data
 */
export class RDFDatastore {
  private store: Store;
  private prefixes: Record<string, string>;

  constructor(quads?: Quad[]) {
    this.store = new Store(quads);
    this.prefixes = {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
    };
  }

  /**
   * Add a triple to the datastore
   */
  addTriple(subject: Subject, predicate: Predicate, object: Object, graph?: Graph): void {
    const q = graph ? quad(subject, predicate, object as any, graph) : quad(subject, predicate, object as any);
    this.store.addQuad(q);
  }

  /**
   * Add multiple quads to the datastore
   */
  addQuads(quads: Quad[]): void {
    this.store.addQuads(quads);
  }

  /**
   * Remove a triple from the datastore
   */
  removeTriple(subject: Subject, predicate: Predicate, object: Object, graph?: Graph): void {
    const q = graph ? quad(subject, predicate, object as any, graph) : quad(subject, predicate, object as any);
    this.store.removeQuad(q);
  }

  /**
   * Remove quads matching the given pattern
   */
  removeMatches(pattern: QueryPattern): void {
    const matches = this.store.getQuads(
      pattern.subject || null,
      pattern.predicate || null,
      pattern.object || null,
      pattern.graph || null
    );
    this.store.removeQuads(matches);
  }

  /**
   * Query the datastore for triples matching the given pattern
   */
  match(pattern: QueryPattern): Quad[] {
    return this.store.getQuads(
      pattern.subject || null,
      pattern.predicate || null,
      pattern.object || null,
      pattern.graph || null
    );
  }

  /**
   * Get all subjects in the datastore
   */
  getSubjects(): Set<Subject> {
    const subjects = new Set<Subject>();
    for (const quad of this.store) {
      subjects.add(quad.subject as Subject);
    }
    return subjects;
  }

  /**
   * Get all predicates in the datastore
   */
  getPredicates(): Set<Predicate> {
    const predicates = new Set<Predicate>();
    for (const quad of this.store) {
      predicates.add(quad.predicate as Predicate);
    }
    return predicates;
  }

  /**
   * Get all objects for a given subject and predicate
   */
  getObjects(subject: Subject, predicate: Predicate, graph?: Graph): Object[] {
    const quads = this.match({ subject, predicate, graph });
    return quads.map((q) => q.object as Object);
  }

  /**
   * Check if the datastore contains a specific triple
   */
  has(subject: Subject, predicate: Predicate, object: Object, graph?: Graph): boolean {
    const q = graph ? quad(subject, predicate, object as any, graph) : quad(subject, predicate, object as any);
    return this.store.has(q);
  }

  /**
   * Get the number of triples in the datastore
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Clear all triples from the datastore
   */
  clear(): void {
    this.store.removeQuads(this.store.getQuads(null, null, null, null));
  }

  /**
   * Get statistics about the datastore
   */
  getStats(): DatastoreStats {
    const subjects = this.getSubjects();
    const predicates = this.getPredicates();
    const graphs = new Set<string>();

    for (const quad of this.store) {
      if (quad.graph) {
        graphs.add(quad.graph.value);
      }
    }

    return {
      tripleCount: this.store.size,
      subjectCount: subjects.size,
      predicateCount: predicates.size,
      graphCount: graphs.size,
    };
  }

  /**
   * Register a prefix for use in serialization
   */
  setPrefix(prefix: string, uri: string): void {
    this.prefixes[prefix] = uri;
  }

  /**
   * Get all registered prefixes
   */
  getPrefixes(): Record<string, string> {
    return { ...this.prefixes };
  }

  /**
   * Parse RDF data from a string
   */
  async parseFromString(data: string, format: string = 'turtle'): Promise<void> {
    return new Promise((resolve, reject) => {
      const parser = new Parser({ format });
      const quads: Quad[] = [];

      parser.parse(data, (error, quad, prefixes) => {
        if (error) {
          reject(error);
        } else if (quad) {
          quads.push(quad);
        } else {
          // Parsing complete
          this.addQuads(quads);
          if (prefixes) {
            Object.entries(prefixes).forEach(([prefix, uri]) => {
              this.setPrefix(prefix, uri.value);
            });
          }
          resolve();
        }
      });
    });
  }

  /**
   * Serialize the datastore to a string
   */
  async serialize(options: SerializationOptions = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new Writer({
        format: options.format || 'turtle',
        prefixes: options.prefixes || this.prefixes,
      });

      writer.addQuads(this.store.getQuads(null, null, null, null));

      writer.end((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Export all quads
   */
  exportQuads(): Quad[] {
    return this.store.getQuads(null, null, null, null);
  }

  /**
   * Get the underlying N3 Store instance
   */
  getStore(): Store {
    return this.store;
  }
}

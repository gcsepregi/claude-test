import { DataFactory } from 'n3';
import { NamedNode, Literal, BlankNode } from './types';

const { namedNode, literal, blankNode } = DataFactory;

/**
 * Create a named node (URI)
 */
export function createNamedNode(uri: string): NamedNode {
  return namedNode(uri);
}

/**
 * Create a literal value
 */
export function createLiteral(
  value: string,
  languageOrDatatype?: string | NamedNode
): Literal {
  if (typeof languageOrDatatype === 'string') {
    return literal(value, languageOrDatatype);
  } else if (languageOrDatatype) {
    return literal(value, languageOrDatatype);
  }
  return literal(value);
}

/**
 * Create a blank node
 */
export function createBlankNode(id?: string): BlankNode {
  return blankNode(id);
}

/**
 * Create a typed literal
 */
export function createTypedLiteral(value: string, datatype: string): Literal {
  return literal(value, namedNode(datatype));
}

/**
 * Create an integer literal
 */
export function createIntegerLiteral(value: number): Literal {
  return createTypedLiteral(
    value.toString(),
    'http://www.w3.org/2001/XMLSchema#integer'
  );
}

/**
 * Create a decimal literal
 */
export function createDecimalLiteral(value: number): Literal {
  return createTypedLiteral(
    value.toString(),
    'http://www.w3.org/2001/XMLSchema#decimal'
  );
}

/**
 * Create a boolean literal
 */
export function createBooleanLiteral(value: boolean): Literal {
  return createTypedLiteral(
    value.toString(),
    'http://www.w3.org/2001/XMLSchema#boolean'
  );
}

/**
 * Create a date literal
 */
export function createDateLiteral(date: Date): Literal {
  return createTypedLiteral(
    date.toISOString().split('T')[0],
    'http://www.w3.org/2001/XMLSchema#date'
  );
}

/**
 * Create a dateTime literal
 */
export function createDateTimeLiteral(date: Date): Literal {
  return createTypedLiteral(
    date.toISOString(),
    'http://www.w3.org/2001/XMLSchema#dateTime'
  );
}

/**
 * Common RDF namespace URIs
 */
export const namespaces = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  owl: 'http://www.w3.org/2002/07/owl#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  dc: 'http://purl.org/dc/elements/1.1/',
  dcterms: 'http://purl.org/dc/terms/',
  foaf: 'http://xmlns.com/foaf/0.1/',
  schema: 'http://schema.org/',
};

/**
 * Helper to create namespaced URIs
 */
export function ns(namespace: string, localName: string): NamedNode {
  return namedNode(namespace + localName);
}

/**
 * Helper to create URIs from common namespaces
 */
export const vocab = {
  rdf: (localName: string) => ns(namespaces.rdf, localName),
  rdfs: (localName: string) => ns(namespaces.rdfs, localName),
  xsd: (localName: string) => ns(namespaces.xsd, localName),
  owl: (localName: string) => ns(namespaces.owl, localName),
  skos: (localName: string) => ns(namespaces.skos, localName),
  dc: (localName: string) => ns(namespaces.dc, localName),
  dcterms: (localName: string) => ns(namespaces.dcterms, localName),
  foaf: (localName: string) => ns(namespaces.foaf, localName),
  schema: (localName: string) => ns(namespaces.schema, localName),
};

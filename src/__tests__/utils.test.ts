import {
  createNamedNode,
  createLiteral,
  createBlankNode,
  createTypedLiteral,
  createIntegerLiteral,
  createDecimalLiteral,
  createBooleanLiteral,
  createDateLiteral,
  createDateTimeLiteral,
  vocab,
  namespaces,
  ns,
} from '../utils';

describe('Utils', () => {
  describe('Node Creation', () => {
    it('should create a named node', () => {
      const node = createNamedNode('http://example.org/resource');
      expect(node.termType).toBe('NamedNode');
      expect(node.value).toBe('http://example.org/resource');
    });

    it('should create a blank node', () => {
      const node = createBlankNode();
      expect(node.termType).toBe('BlankNode');
    });

    it('should create a blank node with ID', () => {
      const node = createBlankNode('n1');
      expect(node.termType).toBe('BlankNode');
      expect(node.value).toBe('n1');
    });

    it('should create a literal', () => {
      const lit = createLiteral('hello');
      expect(lit.termType).toBe('Literal');
      expect(lit.value).toBe('hello');
    });

    it('should create a literal with language tag', () => {
      const lit = createLiteral('hello', 'en');
      expect(lit.termType).toBe('Literal');
      expect(lit.value).toBe('hello');
      expect(lit.language).toBe('en');
    });
  });

  describe('Typed Literals', () => {
    it('should create a typed literal', () => {
      const lit = createTypedLiteral('42', 'http://www.w3.org/2001/XMLSchema#integer');
      expect(lit.termType).toBe('Literal');
      expect(lit.value).toBe('42');
      expect(lit.datatype.value).toBe('http://www.w3.org/2001/XMLSchema#integer');
    });

    it('should create an integer literal', () => {
      const lit = createIntegerLiteral(42);
      expect(lit.value).toBe('42');
      expect(lit.datatype.value).toBe('http://www.w3.org/2001/XMLSchema#integer');
    });

    it('should create a decimal literal', () => {
      const lit = createDecimalLiteral(42.5);
      expect(lit.value).toBe('42.5');
      expect(lit.datatype.value).toBe('http://www.w3.org/2001/XMLSchema#decimal');
    });

    it('should create a boolean literal', () => {
      const lit = createBooleanLiteral(true);
      expect(lit.value).toBe('true');
      expect(lit.datatype.value).toBe('http://www.w3.org/2001/XMLSchema#boolean');
    });

    it('should create a date literal', () => {
      const date = new Date('2024-01-15');
      const lit = createDateLiteral(date);
      expect(lit.value).toContain('2024-01-15');
      expect(lit.datatype.value).toBe('http://www.w3.org/2001/XMLSchema#date');
    });

    it('should create a dateTime literal', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const lit = createDateTimeLiteral(date);
      expect(lit.value).toContain('2024-01-15');
      expect(lit.datatype.value).toBe('http://www.w3.org/2001/XMLSchema#dateTime');
    });
  });

  describe('Namespaces', () => {
    it('should have common namespaces defined', () => {
      expect(namespaces.rdf).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
      expect(namespaces.rdfs).toBe('http://www.w3.org/2000/01/rdf-schema#');
      expect(namespaces.xsd).toBe('http://www.w3.org/2001/XMLSchema#');
      expect(namespaces.foaf).toBe('http://xmlns.com/foaf/0.1/');
      expect(namespaces.schema).toBe('http://schema.org/');
    });

    it('should create namespaced URIs', () => {
      const node = ns(namespaces.foaf, 'name');
      expect(node.value).toBe('http://xmlns.com/foaf/0.1/name');
    });

    it('should create URIs using vocab helpers', () => {
      const rdfType = vocab.rdf('type');
      expect(rdfType.value).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

      const foafName = vocab.foaf('name');
      expect(foafName.value).toBe('http://xmlns.com/foaf/0.1/name');

      const schemaName = vocab.schema('name');
      expect(schemaName.value).toBe('http://schema.org/name');
    });
  });
});

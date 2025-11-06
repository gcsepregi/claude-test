/**
 * MUD Ontology - Defines the vocabulary for the MUD engine
 * Uses RDF to model game world entities and relationships
 */

import { createNamedNode, vocab } from '../utils';
import { NamedNode } from 'n3';

// Define the MUD namespace
const MUD_NS = 'http://example.org/mud#';

/**
 * Helper to create MUD vocabulary terms
 */
function mudTerm(localName: string): NamedNode {
  return createNamedNode(MUD_NS + localName);
}

/**
 * MUD Vocabulary - RDF terms for game entities and properties
 */
export const mudVocab = {
  // Classes (types)
  Room: mudTerm('Room'),
  Item: mudTerm('Item'),
  Player: mudTerm('Player'),

  // Properties
  name: mudTerm('name'),
  description: mudTerm('description'),
  location: mudTerm('location'),
  contains: mudTerm('contains'),
  portable: mudTerm('portable'),

  // Exit directions
  north: mudTerm('north'),
  south: mudTerm('south'),
  east: mudTerm('east'),
  west: mudTerm('west'),
  up: mudTerm('up'),
  down: mudTerm('down'),

  // Player-specific
  inventory: mudTerm('inventory'),
};

/**
 * Standard RDF types we'll use
 */
export const rdfTypes = {
  type: vocab.rdf('type'),
};

/**
 * All available exit directions
 */
export const exitDirections = [
  'north', 'south', 'east', 'west', 'up', 'down'
] as const;

export type ExitDirection = typeof exitDirections[number];

/**
 * Namespace prefix for serialization
 */
export const mudPrefix = {
  mud: MUD_NS
};

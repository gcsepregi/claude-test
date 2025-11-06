/**
 * MudWorld - Manages the game world using RDF datastore
 */

import { RDFDatastore } from '../RDFDatastore';
import { mudVocab, rdfTypes, mudPrefix, ExitDirection } from './ontology';
import { createNamedNode, createLiteral, createBooleanLiteral } from '../utils';
import { NamedNode } from 'n3';

/**
 * Main class for managing the MUD world state
 */
export class MudWorld {
  private store: RDFDatastore;
  private entityCounter: number;

  constructor() {
    this.store = new RDFDatastore();
    this.entityCounter = 0;

    // Set up prefixes for nice serialization
    this.store.setPrefix('mud', mudPrefix.mud);
  }

  /**
   * Generate a unique ID for entities
   */
  private generateId(type: string): string {
    this.entityCounter++;
    return `${type}-${this.entityCounter}`;
  }

  /**
   * Create a URI for an entity
   */
  private entityUri(id: string): NamedNode {
    return createNamedNode(`http://example.org/game/${id}`);
  }

  /**
   * Create a new room
   */
  createRoom(name: string, description: string): string {
    const id = this.generateId('room');
    const room = this.entityUri(id);

    this.store.addTriple(room, rdfTypes.type, mudVocab.Room);
    this.store.addTriple(room, mudVocab.name, createLiteral(name));
    this.store.addTriple(room, mudVocab.description, createLiteral(description));

    return id;
  }

  /**
   * Connect two rooms with an exit
   */
  connectRooms(fromRoomId: string, direction: ExitDirection, toRoomId: string): void {
    const fromRoom = this.entityUri(fromRoomId);
    const toRoom = this.entityUri(toRoomId);
    const exitPredicate = mudVocab[direction];

    this.store.addTriple(fromRoom, exitPredicate, toRoom);
  }

  /**
   * Create a new item
   */
  createItem(name: string, description: string, portable: boolean = true): string {
    const id = this.generateId('item');
    const item = this.entityUri(id);

    this.store.addTriple(item, rdfTypes.type, mudVocab.Item);
    this.store.addTriple(item, mudVocab.name, createLiteral(name));
    this.store.addTriple(item, mudVocab.description, createLiteral(description));
    this.store.addTriple(item, mudVocab.portable, createBooleanLiteral(portable));

    return id;
  }

  /**
   * Place an item in a room
   */
  placeItem(itemId: string, roomId: string): void {
    const item = this.entityUri(itemId);
    const room = this.entityUri(roomId);

    this.store.addTriple(item, mudVocab.location, room);
    this.store.addTriple(room, mudVocab.contains, item);
  }

  /**
   * Create a new player
   */
  createPlayer(name: string, startingRoomId: string): string {
    const id = this.generateId('player');
    const player = this.entityUri(id);
    const room = this.entityUri(startingRoomId);

    this.store.addTriple(player, rdfTypes.type, mudVocab.Player);
    this.store.addTriple(player, mudVocab.name, createLiteral(name));
    this.store.addTriple(player, mudVocab.location, room);

    return id;
  }

  /**
   * Get a room's name
   */
  getRoomName(roomId: string): string | null {
    const room = this.entityUri(roomId);
    const names = this.store.getObjects(room, mudVocab.name);
    return names.length > 0 ? names[0].value : null;
  }

  /**
   * Get a room's description
   */
  getRoomDescription(roomId: string): string | null {
    const room = this.entityUri(roomId);
    const descriptions = this.store.getObjects(room, mudVocab.description);
    return descriptions.length > 0 ? descriptions[0].value : null;
  }

  /**
   * Get all exits from a room
   */
  getRoomExits(roomId: string): Map<ExitDirection, string> {
    const room = this.entityUri(roomId);
    const exits = new Map<ExitDirection, string>();

    const directions: ExitDirection[] = ['north', 'south', 'east', 'west', 'up', 'down'];

    for (const direction of directions) {
      const exitRooms = this.store.getObjects(room, mudVocab[direction]);
      if (exitRooms.length > 0) {
        const targetUri = exitRooms[0].value;
        const targetId = targetUri.split('/').pop() || '';
        exits.set(direction, targetId);
      }
    }

    return exits;
  }

  /**
   * Get all items in a room
   */
  getRoomItems(roomId: string): string[] {
    const room = this.entityUri(roomId);
    const itemNodes = this.store.getObjects(room, mudVocab.contains);

    return itemNodes.map(node => {
      const uri = node.value;
      return uri.split('/').pop() || '';
    });
  }

  /**
   * Get an item's name
   */
  getItemName(itemId: string): string | null {
    const item = this.entityUri(itemId);
    const names = this.store.getObjects(item, mudVocab.name);
    return names.length > 0 ? names[0].value : null;
  }

  /**
   * Get an item's description
   */
  getItemDescription(itemId: string): string | null {
    const item = this.entityUri(itemId);
    const descriptions = this.store.getObjects(item, mudVocab.description);
    return descriptions.length > 0 ? descriptions[0].value : null;
  }

  /**
   * Check if an item is portable
   */
  isItemPortable(itemId: string): boolean {
    const item = this.entityUri(itemId);
    const portable = this.store.getObjects(item, mudVocab.portable);
    return portable.length > 0 && portable[0].value === 'true';
  }

  /**
   * Get player's current location
   */
  getPlayerLocation(playerId: string): string | null {
    const player = this.entityUri(playerId);
    const locations = this.store.getObjects(player, mudVocab.location);

    if (locations.length > 0) {
      const uri = locations[0].value;
      return uri.split('/').pop() || null;
    }

    return null;
  }

  /**
   * Move player to a new room
   */
  movePlayer(playerId: string, roomId: string): void {
    const player = this.entityUri(playerId);
    const newRoom = this.entityUri(roomId);

    // Remove old location
    const oldLocations = this.store.getObjects(player, mudVocab.location);
    for (const oldLocation of oldLocations) {
      this.store.removeTriple(player, mudVocab.location, oldLocation);
    }

    // Set new location
    this.store.addTriple(player, mudVocab.location, newRoom);
  }

  /**
   * Add item to player's inventory
   */
  addToInventory(playerId: string, itemId: string): void {
    const player = this.entityUri(playerId);
    const item = this.entityUri(itemId);

    // Remove from room if it was there
    const locations = this.store.getObjects(item, mudVocab.location);
    for (const location of locations) {
      this.store.removeTriple(item, mudVocab.location, location);
      this.store.removeTriple(location as NamedNode, mudVocab.contains, item);
    }

    // Add to inventory
    this.store.addTriple(player, mudVocab.inventory, item);
    this.store.addTriple(item, mudVocab.location, player);
  }

  /**
   * Remove item from player's inventory
   */
  removeFromInventory(playerId: string, itemId: string): void {
    const player = this.entityUri(playerId);
    const item = this.entityUri(itemId);

    this.store.removeTriple(player, mudVocab.inventory, item);
    this.store.removeTriple(item, mudVocab.location, player);
  }

  /**
   * Get player's inventory
   */
  getPlayerInventory(playerId: string): string[] {
    const player = this.entityUri(playerId);
    const items = this.store.getObjects(player, mudVocab.inventory);

    return items.map(node => {
      const uri = node.value;
      return uri.split('/').pop() || '';
    });
  }

  /**
   * Drop item from inventory to current room
   */
  dropItem(playerId: string, itemId: string): void {
    const playerLocation = this.getPlayerLocation(playerId);
    if (!playerLocation) return;

    this.removeFromInventory(playerId, itemId);
    this.placeItem(itemId, playerLocation);
  }

  /**
   * Export the world state as RDF
   */
  async exportWorld(): Promise<string> {
    return this.store.serialize({ format: 'turtle' });
  }

  /**
   * Get the underlying RDF store (for advanced queries)
   */
  getStore(): RDFDatastore {
    return this.store;
  }
}

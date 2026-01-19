import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  attackPower: number;
  defense: number;
  gold: number;
}

export interface Inventory {
  items: InventoryItem[];
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'quest';
  quantity: number;
  description: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private playerStatsSubject = new BehaviorSubject<PlayerStats>({
    health: 100,
    maxHealth: 100,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    attackPower: 10,
    defense: 5,
    gold: 0
  });

  private inventorySubject = new BehaviorSubject<Inventory>({
    items: []
  });

  private gameStateSubject = new BehaviorSubject<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');

  public playerStats$: Observable<PlayerStats> = this.playerStatsSubject.asObservable();
  public inventory$: Observable<Inventory> = this.inventorySubject.asObservable();
  public gameState$: Observable<string> = this.gameStateSubject.asObservable();

  constructor() {
    this.loadGameData();
  }

  // Player Stats
  updatePlayerStats(stats: Partial<PlayerStats>): void {
    const currentStats = this.playerStatsSubject.value;
    const newStats = { ...currentStats, ...stats };
    this.playerStatsSubject.next(newStats);
    this.saveGameData();
  }

  getPlayerStats(): PlayerStats {
    return this.playerStatsSubject.value;
  }

  // Inventory
  addItem(item: InventoryItem): void {
    const inventory = this.inventorySubject.value;
    const existingItem = inventory.items.find(i => i.id === item.id);

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      inventory.items.push(item);
    }

    this.inventorySubject.next(inventory);
    this.saveGameData();
  }

  removeItem(itemId: string, quantity: number = 1): void {
    const inventory = this.inventorySubject.value;
    const item = inventory.items.find(i => i.id === itemId);

    if (item) {
      item.quantity -= quantity;
      if (item.quantity <= 0) {
        inventory.items = inventory.items.filter(i => i.id !== itemId);
      }
    }

    this.inventorySubject.next(inventory);
    this.saveGameData();
  }

  useItem(itemId: string): void {
    const inventory = this.inventorySubject.value;
    const item = inventory.items.find(i => i.id === itemId);

    if (item && item.type === 'consumable') {
      // Apply item effect
      this.applyItemEffect(item);
      this.removeItem(itemId, 1);
    }
  }

  private applyItemEffect(item: InventoryItem): void {
    // Apply effects based on item type
    if (item.id === 'health_potion') {
      const stats = this.playerStatsSubject.value;
      const newHealth = Math.min(stats.maxHealth, stats.health + 50);
      this.updatePlayerStats({ health: newHealth });
    }
  }

  // Game State
  setGameState(state: 'menu' | 'playing' | 'paused' | 'gameOver'): void {
    this.gameStateSubject.next(state);
  }

  getGameState(): string {
    return this.gameStateSubject.value;
  }

  // Save/Load
  private saveGameData(): void {
    const gameData = {
      playerStats: this.playerStatsSubject.value,
      inventory: this.inventorySubject.value
    };
    localStorage.setItem('duskAdventures_saveData', JSON.stringify(gameData));
  }

  private loadGameData(): void {
    const savedData = localStorage.getItem('duskAdventures_saveData');
    if (savedData) {
      try {
        const gameData = JSON.parse(savedData);
        if (gameData.playerStats) {
          this.playerStatsSubject.next(gameData.playerStats);
        }
        if (gameData.inventory) {
          this.inventorySubject.next(gameData.inventory);
        }
      } catch (error) {
        console.error('Error loading game data:', error);
      }
    }
  }

  resetGame(): void {
    this.playerStatsSubject.next({
      health: 100,
      maxHealth: 100,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      attackPower: 10,
      defense: 5,
      gold: 0
    });
    this.inventorySubject.next({ items: [] });
    this.saveGameData();
  }
}
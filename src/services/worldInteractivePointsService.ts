import { supabase } from "../lib/supabase";

export interface WorldInteractivePoint {
  id: string;
  world_id: string;
  x_percent: number;
  y_percent: number;
  width_percent: number;
  height_percent: number;
  title: string;
  description?: string;
  action_type: "dialog" | "shop" | "minigame" | "quest" | "teleport";
  action_data: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateInteractivePointData {
  world_id: string;
  x_percent: number;
  y_percent: number;
  title: string;
  description?: string;
  action_type?: "dialog" | "shop" | "minigame" | "quest" | "teleport";
  action_data?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateInteractivePointData {
  x_percent?: number;
  y_percent?: number;
  title?: string;
  description?: string;
  action_type?: "dialog" | "shop" | "minigame" | "quest" | "teleport";
  action_data?: Record<string, any>;
  is_active?: boolean;
}

class WorldInteractivePointsService {
  async getPointsForWorld(worldId: string): Promise<WorldInteractivePoint[]> {
    try {
      const { data, error } = await supabase
        .from("world_interactive_points")
        .select("*")
        .eq("world_id", worldId)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching world interactive points:", error);
      return [];
    }
  }

  async getAllPointsForWorld(
    worldId: string,
  ): Promise<WorldInteractivePoint[]> {
    try {
      const { data, error } = await supabase
        .from("world_interactive_points")
        .select("*")
        .eq("world_id", worldId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching all world interactive points:", error);
      return [];
    }
  }

  async createPoint(
    pointData: CreateInteractivePointData,
  ): Promise<WorldInteractivePoint | null> {
    try {
      const { data, error } = await supabase
        .from("world_interactive_points")
        .insert({
          ...pointData,
          action_type: pointData.action_type || "dialog",
          action_data: pointData.action_data || {},
          is_active: pointData.is_active !== false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating interactive point:", error);
      return null;
    }
  }

  async updatePoint(
    pointId: string,
    updates: UpdateInteractivePointData,
  ): Promise<WorldInteractivePoint | null> {
    try {
      const { error: updateError } = await supabase
        .from("world_interactive_points")
        .update(updates)
        .eq("id", pointId);

      if (updateError) throw updateError;

      const { data, error: selectError } = await supabase
        .from("world_interactive_points")
        .select("*")
        .eq("id", pointId)
        .single();

      if (selectError) throw selectError;
      return data;
    } catch (error) {
      console.error("Error updating interactive point:", error);
      return null;
    }
  }

  async deletePoint(pointId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("world_interactive_points")
        .delete()
        .eq("id", pointId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting interactive point:", error);
      return false;
    }
  }

  async togglePointActive(
    pointId: string,
    isActive: boolean,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("world_interactive_points")
        .update({ is_active: isActive })
        .eq("id", pointId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error toggling point active status:", error);
      return false;
    }
  }
}

export const worldInteractivePointsService =
  new WorldInteractivePointsService();

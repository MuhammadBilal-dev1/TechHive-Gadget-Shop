/**
 * Drop this file at: react-native-gadget-shop/src/api/profile.ts
 * (new file)
 *
 * ⚠️ Assumes the users table has columns: id, email, avatar_url
 * (these are the ones used elsewhere in this app already — list-header
 * reads a hardcoded avatar, auth trigger sets avatar_url on signup).
 * If your real column names differ, just adjust the .select()/.update()
 * strings below.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/auth-provider";

export type Profile = {
  id: string;
  email: string;
  avatar_url: string | null;
};

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) throw new Error(`Error fetching profile: ${error.message}`);

      return data as Profile;
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    async mutationFn(avatarUrl: string) {
      const { error } = await supabase
        .from("users")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);

      if (error) throw new Error(`Error updating avatar: ${error.message}`);
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
};
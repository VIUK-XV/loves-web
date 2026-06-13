declare module "@supabase/supabase-js" {
  export type RealtimeChannel = {
    on: (...args: unknown[]) => RealtimeChannel;
    subscribe: (callback?: (status: string) => void | Promise<void>) => RealtimeChannel;
    track: (payload: Record<string, unknown>) => Promise<unknown>;
    untrack: () => Promise<unknown>;
    presenceState: () => Record<string, unknown[]>;
  };

  export type SupabaseClient = {
    auth: {
      getSession: () => Promise<{
        data: { session: { user: { id: string } } | null };
      }>;
      signInAnonymously: () => Promise<{
        data: { user: { id: string } | null };
        error: { message?: string } | null;
      }>;
    };
    rpc: (
      name: string,
      params?: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
    channel: (name: string, options?: Record<string, unknown>) => RealtimeChannel;
    removeChannel: (channel: RealtimeChannel) => Promise<unknown>;
    from: (table: string) => {
      update: (values: Record<string, unknown>) => {
        eq: (column: string, value: unknown) => {
          select: () => {
            single: () => Promise<{ data: unknown; error: { message: string } | null }>;
          };
        };
      };
    };
  };

  export function createClient(
    url: string,
    anonKey: string,
    options?: Record<string, unknown>,
  ): SupabaseClient;
}

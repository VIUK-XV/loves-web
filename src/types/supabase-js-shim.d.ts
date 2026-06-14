declare module "@supabase/supabase-js" {
  type SupabaseQueryResult = {
    data: unknown;
    error: { message: string } | null;
  };

  type SupabaseQuery = PromiseLike<SupabaseQueryResult> & {
    select: (columns?: string) => SupabaseQuery;
    insert: (values: Record<string, unknown> | Record<string, unknown>[]) => SupabaseQuery;
    update: (values: Record<string, unknown>) => SupabaseQuery;
    upsert: (
      values: Record<string, unknown> | Record<string, unknown>[],
      options?: Record<string, unknown>,
    ) => SupabaseQuery;
    delete: () => SupabaseQuery;
    eq: (column: string, value: unknown) => SupabaseQuery;
    order: (column: string, options?: Record<string, unknown>) => SupabaseQuery;
    single: () => Promise<SupabaseQueryResult>;
  };

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
    from: (table: string) => SupabaseQuery;
  };

  export function createClient(
    url: string,
    anonKey: string,
    options?: Record<string, unknown>,
  ): SupabaseClient;
}

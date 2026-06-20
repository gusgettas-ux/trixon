import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function useSharedState(key, initial) {
  const [value, setValue] = useState(initial);
  const [loaded, setLoaded] = useState(false);
  const ignoreNextRealtime = useRef(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("trixon_state")
        .select("data")
        .eq("key", key)
        .maybeSingle();
      if (!active) return;
      if (!error && data && data.data != null) {
        setValue(data.data);
      } else {
        await supabase.from("trixon_state").upsert({ key, data: initial });
        setValue(initial);
      }
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [key]);

  useEffect(() => {
    const channel = supabase
      .channel(`trixon_state:${key}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trixon_state", filter: `key=eq.${key}` },
        (payload) => {
          if (ignoreNextRealtime.current) {
            ignoreNextRealtime.current = false;
            return;
          }
          if (payload.new && payload.new.data != null) {
            setValue(payload.new.data);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [key]);

  const update = (next) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      ignoreNextRealtime.current = true;
      supabase
        .from("trixon_state")
        .upsert({ key, data: resolved })
        .then(({ error }) => {
          if (error) console.error("Supabase save error:", error.message);
        });
      return resolved;
    });
  };

  return [value, update, loaded];
}

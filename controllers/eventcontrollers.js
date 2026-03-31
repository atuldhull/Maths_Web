import supabase from "../config/supabase.js";

/* ── helper: compute event status ── */
function computeStatus(ev) {
  const now      = new Date();
  const eventDate = ev.date ? new Date(ev.date) : null;
  const deadline  = ev.registration_deadline ? new Date(ev.registration_deadline) : null;

  if (!ev.is_active) return "cancelled";
  if (eventDate && now > eventDate) return "past";
  if (!ev.registration_open) return "closed";
  if (deadline && now > deadline) return "closed";
  if (deadline && now < deadline) return "registering";
  if (!ev.registration_form_url) return "upcoming";
  return "registering";
}

/* ═══════════════════════════════════
   GET ALL EVENTS
   GET /api/events
═══════════════════════════════════ */
export const getEvents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .order("date", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    const enriched = (data || []).map(ev => ({
      ...ev,
      status: computeStatus(ev),
    }));

    return res.json(enriched);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch events" });
  }
};

/* ═══════════════════════════════════
   GET SINGLE EVENT
   GET /api/events/:id
═══════════════════════════════════ */
export const getEvent = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("events").select("*")
      .eq("id", req.params.id).maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data)  return res.status(404).json({ error: "Event not found" });

    return res.json({ ...data, status: computeStatus(data) });
  } catch (err) {
    return res.status(500).json({ error: "Failed" });
  }
};

/* ═══════════════════════════════════
   CREATE EVENT (admin/teacher)
   POST /api/events
═══════════════════════════════════ */
export const createEvent = async (req, res) => {
  try {
    const {
      title, description, date, location, time,
      registration_form_url,
      registration_deadline,
      max_registrations,
      event_type,
      organiser,
      tags,
      banner_color,
    } = req.body;

    if (!title) return res.status(400).json({ error: "title required" });

    const { data, error } = await supabase.from("events").insert({
      title,
      description,
      date,
      location,
      time,
      registration_form_url:  registration_form_url  || null,
      registration_deadline:  registration_deadline  || null,
      max_registrations:      max_registrations      || null,
      event_type:             event_type             || "general",
      organiser:              organiser              || null,
      tags:                   tags                   || [],
      banner_color:           banner_color           || "#7c3aed",
      registration_open:      true,
      is_active:              true,
    }).select().single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true, event: data });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create event" });
  }
};

/* ═══════════════════════════════════
   UPDATE EVENT (admin/teacher)
   PATCH /api/events/:id
═══════════════════════════════════ */
export const updateEvent = async (req, res) => {
  try {
    const allowed = [
      "title","description","date","location","time",
      "registration_form_url","registration_deadline",
      "registration_open","max_registrations",
      "event_type","organiser","tags","banner_color","is_active",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const { data, error } = await supabase.from("events")
      .update(updates).eq("id", req.params.id).select().single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, event: { ...data, status: computeStatus(data) } });
  } catch (err) {
    return res.status(500).json({ error: "Failed" });
  }
};

/* ═══════════════════════════════════
   DELETE EVENT (admin/teacher)
   DELETE /api/events/:id
═══════════════════════════════════ */
export const deleteEvent = async (req, res) => {
  try {
    await supabase.from("events").update({ is_active: false }).eq("id", req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed" });
  }
};

/* ═══════════════════════════════════
   TOGGLE REGISTRATION (admin/teacher)
   PATCH /api/events/:id/toggle-registration
═══════════════════════════════════ */
export const toggleRegistration = async (req, res) => {
  try {
    const { data: ev } = await supabase.from("events")
      .select("registration_open").eq("id", req.params.id).maybeSingle();
    if (!ev) return res.status(404).json({ error: "Not found" });

    const { data, error } = await supabase.from("events")
      .update({ registration_open: !ev.registration_open })
      .eq("id", req.params.id).select().single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, registration_open: data.registration_open });
  } catch (err) {
    return res.status(500).json({ error: "Failed" });
  }
};

/* ═══════════════════════════════════════════════════════
   SITE SETTINGS — get all
   GET /api/events/settings
═══════════════════════════════════════════════════════ */
export const getSiteSettings = async (req, res) => {
  try {
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) return res.status(500).json({ error: error.message });
    const settings = {};
    (data || []).forEach(row => { settings[row.key] = row.value; });
    return res.json(settings);
  } catch (err) {
    return res.status(500).json({ error: "Failed" });
  }
};

/* ═══════════════════════════════════════════════════════
   SITE SETTINGS — update one key
   PATCH /api/events/settings/:key
═══════════════════════════════════════════════════════ */
export const updateSiteSetting = async (req, res) => {
  const userId = req.session?.user?.id;
  try {
    const { value } = req.body;
    const key = req.params.key;

    const allowed_keys = ["registrations_open", "site_notice", "arena_open", "registration_message"];
    if (!allowed_keys.includes(key))
      return res.status(400).json({ error: "Unknown setting key" });

    const { error } = await supabase.from("site_settings")
      .upsert({ key, value: String(value), updated_at: new Date().toISOString(), updated_by: userId });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, key, value });
  } catch (err) {
    return res.status(500).json({ error: "Failed" });
  }
};
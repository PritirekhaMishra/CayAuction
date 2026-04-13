const BASE_URL = "http://127.0.0.1:8000/api"

export const apiRequest = async (url: string, options: any = {}) => {
  try {
    const isFormData = options.body instanceof FormData

    const headers: any = {
      ...(options.headers || {})
    }

    // ✅ Only set JSON header if NOT FormData
    if (!isFormData) {
      headers["Content-Type"] = "application/json"
    }

    // ✅ Optional: token fallback (if you store it)
    

    const res = await fetch(`${BASE_URL}${url}`, {
      method: options.method || "GET",
      credentials: "include", // 🔥 REQUIRED FOR COOKIE AUTH
      headers,
      body: options.body
        ? isFormData
          ? options.body
          : JSON.stringify(options.body)
        : null
    })

    // ================= SAFE JSON PARSE =================
    let data = null
    try {
      data = await res.json()
    } catch {
      data = null
    }

    // ================= AUTH ERRORS =================
    if (res.status === 401) {
      console.error("❌ 401 Unauthorized", data)

      // 🔥 Optional: auto logout
      localStorage.removeItem("token")

      return { error: "unauthorized" }
    }

    if (res.status === 403) {
      console.error("❌ 403 Forbidden", data)
      return { error: "forbidden" }
    }

    // ================= OTHER ERRORS =================
    if (!res.ok) {
      console.error("❌ API ERROR:", data)
      return { error: data || "unknown error" }
    }

    return data

  } catch (error) {
    console.error("❌ Network Error:", error)
    return { error: "network error" }
  }
}
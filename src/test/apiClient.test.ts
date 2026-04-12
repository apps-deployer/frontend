import { afterEach, beforeEach } from "vitest";
import { apiRequest, authRequest } from "../api/client";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  localStorage.removeItem("token");
});

afterEach(() => {
  vi.restoreAllMocks();
});

function okJson(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

describe("apiRequest", () => {
  it("sends GET request to deployments service base URL", async () => {
    mockFetch.mockReturnValueOnce(okJson({ items: [] }));

    await apiRequest("/api/v1/projects");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/projects",
      expect.objectContaining({ headers: expect.objectContaining({ "Content-Type": "application/json" }) })
    );
  });

  it("includes Authorization header when token is in localStorage", async () => {
    localStorage.setItem("token", "test-jwt-token");
    mockFetch.mockReturnValueOnce(okJson({}));

    await apiRequest("/api/v1/projects");

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers["Authorization"]).toBe("Bearer test-jwt-token");
  });

  it("does NOT include Authorization header when no token", async () => {
    mockFetch.mockReturnValueOnce(okJson({}));

    await apiRequest("/api/v1/projects");

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("sends POST with JSON body", async () => {
    mockFetch.mockReturnValueOnce(okJson({ id: "1", name: "test" }, 201));

    await apiRequest("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify({ name: "test", repo_url: "https://github.com/x/y" }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns undefined for 204 No Content", async () => {
    mockFetch.mockReturnValueOnce(Promise.resolve(new Response(null, { status: 204 })));

    const result = await apiRequest("/api/v1/envs/123");
    expect(result).toBeUndefined();
  });

  it("throws with error detail on non-OK response", async () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve(
        new Response(JSON.stringify({ detail: "Not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    await expect(apiRequest("/api/v1/projects/bad-id")).rejects.toThrow("Not found");
  });
});

describe("authRequest", () => {
  it("sends request to auth service base URL", async () => {
    mockFetch.mockReturnValueOnce(okJson({ id: "1" }));

    await authRequest("/api/v1/auth/me");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8001/api/v1/auth/me",
      expect.any(Object)
    );
  });
});

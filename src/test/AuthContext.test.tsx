import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  localStorage.removeItem("token");
});

afterEach(() => {
  vi.restoreAllMocks();
});

function TestConsumer() {
  const { user, loading, logout } = useAuth();
  if (loading) return <p>loading</p>;
  if (!user) return <p>logged out</p>;
  return (
    <div>
      <p>user: {user.github_login}</p>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  it("shows logged-out when no token", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText("logged out")).toBeInTheDocument());
  });

  it("fetches user and shows login when token in localStorage", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ id: "1", github_login: "testuser", avatar_url: "" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText("user: testuser")).toBeInTheDocument());
  });

  it("clears user on logout", async () => {
    localStorage.setItem("token", "valid-token");
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ id: "1", github_login: "testuser", avatar_url: "" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => screen.getByText("user: testuser"));

    act(() => {
      screen.getByText("logout").click();
    });

    expect(screen.getByText("logged out")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("removes token and shows logged-out when /me returns 401", async () => {
    localStorage.setItem("token", "expired-token");
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: "Token expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText("logged out")).toBeInTheDocument());
    expect(localStorage.getItem("token")).toBeNull();
  });
});

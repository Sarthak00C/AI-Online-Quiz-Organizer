const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class APIClient {
  // ❌ REMOVE constructor token
  constructor() { }

  // ✅ ALWAYS read from localStorage
  getHeaders() {
    const token = localStorage.getItem("auth_token");

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // ❌ REMOVE token memory
  setToken(token) {
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    localStorage.removeItem("auth_token");
  }

  async request(method, endpoint, body) {
    const url = `${API_BASE_URL}${endpoint}`;

    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: response.statusText,
      }));

      if (error.errors && Array.isArray(error.errors)) {
        const messages = error.errors
          .map((err) => err.msg || err.message)
          .join(", ");
        throw new Error(messages || "Validation failed");
      }

      throw new Error(error.error || error.message || "API request failed");
    }

    return response.json();
  }

  // =======================
  // AUTH
  // =======================
  async signup(email, password, name, role) {
    const data = await this.request("POST", "/auth/signup", {
      email,
      password,
      name,
      role,
    });

    if (data.token) {
      this.setToken(data.token);
    }

    return data;
  }

  async signin(email, password) {
    const data = await this.request("POST", "/auth/signin", {
      email,
      password,
    });

    if (data.token) {
      this.setToken(data.token);
    }

    return data;
  }

  async getMe() {
    return this.request("GET", "/auth/me");
  }

  // =======================
  // QUIZ
  // =======================
  async getMyQuizzes() {
    return this.request("GET", "/quizzes/my-quizzes");
  }

  async getLeaderboard(quizCode) {
    return this.request("GET", `/attempts/quiz/${quizCode}/leaderboard`);
  }

  async getAttempts() {
    return this.request("GET", "/attempts");
  }

  async submitAttempt(quizId, answers) {
    return this.request("POST", "/attempts", {
      quizId,
      answers,
    });
  }

  // (keep rest same as your original)


  // =======================
  // QUIZ METHODS (FIX)
  // =======================

  // Get quiz by ID
  async getQuiz(id) {
    return this.request("GET", `/quizzes/${id}`);
  }

  // Get quiz by code
  async getQuizByCode(code) {
    return this.request("GET", `/quizzes/code/${code}`);
  }

  // Create quiz
  async createQuiz(title, topic, difficulty, timeLimit) {
    return this.request("POST", "/quizzes", {
      title,
      topic,
      difficulty,
      timeLimit,
    });
  }

  // ✅ FIXED: update quiz (activate/deactivate)
  async updateQuiz(id, updates) {
    return this.request("PUT", `/quizzes/${id}`, updates);
  }

  // Delete quiz
  async deleteQuiz(id) {
    return this.request("DELETE", `/quizzes/${id}`);
  }

  // =======================
  // QUESTION METHODS (FIX)
  // =======================

  async addQuestions(quizId, questions) {
    return this.request("POST", "/questions", {
      quizId,
      questions,
    });
  }

  async getQuestions(quizId) {
    return this.request("GET", `/questions/quiz/${quizId}`);
  }

  async deleteQuestion(id) {
    return this.request("DELETE", `/questions/${id}`);
  }

  // =======================
  // AI METHODS (ADD THIS)
  // =======================

  async generateQuiz(prompt, topic, difficulty, count) {
    return this.request("POST", "/ai/generate-quiz", {
      prompt,
      topic,
      difficulty,
      count,
    });
  }
}

const apiClient = new APIClient();

export { APIClient, apiClient };
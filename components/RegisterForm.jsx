import React, { useState } from "react";


/**
 * RegisterForm - handles user registration via POST /user.
 */
function RegisterForm() {
  const [formData, setFormData] = useState({
    login_name: "",
    password: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });

  const [message, setMessage] = useState(null);       // success / error text
  const [isError, setIsError] = useState(false);      // true = error style

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setIsError(false);

    try {
      const response = await fetch("/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 200) {
        // Registration successful: clear form and show success message
        setFormData({
          login_name: "",
          password: "",
          first_name: "",
          last_name: "",
          location: "",
          description: "",
          occupation: "",
        });
        setIsError(false);
        setMessage("Registration successful!");
      } else {
        const text = await response.text();
        setIsError(true);
        setMessage(text || "Registration failed.");
      }
    } catch (err) {
      console.error("Error calling /user:", err);
      setIsError(true);
      setMessage("An error occurred. Please try again.");
    }
  };

  /**
   * renders all required input fields (login_name, password, first/last name,
   * location, description, occupation) and binds them to component state.
   * Inline CSS is used for simple spacing and message styling.
   */

  return (
    <div style={{ marginTop: "16px" }}>
      <h3>Register New User</h3>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Login Name:
            <input
              type="text"
              name="login_name"
              value={formData.login_name}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div>
          <label>
            First Name:
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Last Name:
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Location:
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <label>
            Description:
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <label>
            Occupation:
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
            />
          </label>
        </div>

        <button type="submit">Register</button>
      </form>

      {message && (
        <p style={{ color: isError ? "red" : "green", marginTop: "8px" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default RegisterForm;

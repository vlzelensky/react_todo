import React from "react";
import axios from "axios";
import { Button, TextField, Link } from "@material-ui/core";
import RegisterComponent from "../RegisterComponent";
import "./login.css";

class LoginComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: true,
      email: "",
      password: "",
    };
  }

  changeStatus = () => {
    this.setState((state) => ({ status: !state.status }));
  };

  signInOnEnter = async (event) => {
    if (event.key === "Enter") {
      const { email, password } = this.state;
      if (Object.values(this.state).some((value) => !value)) {
        return;
      }
      try {
        const res = await axios.post("api/login", {
          email: email,
          password: password,
        });
        if (res.status !== 200 && res.status !== 201) {
          throw new Error(res.status);
        }
        this.props.onLogin(res.data);
        this.props.history.push("/todo");
      } catch (e) {
        console.warn(e);
      }
    }
  };

  signIn = async () => {
    const { email, password } = this.state;
    if (Object.values(this.state).some((value) => !value)) {
      return;
    }
    try {
      const res = await axios.post("api/login", {
        email: email,
        password: password,
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error(res.status);
      }
      this.props.onLogin(res.data);
      this.props.history.push("/todo");
    } catch (e) {
      console.warn(e);
    }
  };

  renderLogin = () => {
    return (
      <div className="main-box">
        <h1>login</h1>
        <div className="field">
          <TextField
            autoComplete="off"
            label="Email"
            className="form"
            onChange={(event) =>
              this.setState({ email: event.target.value.trim() })
            }
            onKeyDown={(event) => this.signInOnEnter(event)}
          />
        </div>
        <div className="field">
          <TextField
            type="password"
            label="Password"
            className="form"
            onChange={(event) =>
              this.setState({ password: event.target.value.trim() })
            }
            onKeyDown={(event) => this.signInOnEnter(event)}
          />
        </div>
        <div className="btns">
          <Button
            variant="contained"
            onClick={this.signIn}
            color="default"
            className="btn"
          >
            Sign In
          </Button>
          <span>or</span>
          <span className="a1" onClick={this.changeStatus}>
            create an account
          </span>
        </div>
        <div>
          <Link href={"/change_password"} className="a2">
            forgot your password?
          </Link>
        </div>
      </div>
    );
  };

  render() {
    const { status } = this.state;
    return (
      <>
        {status ? (
          this.renderLogin()
        ) : (
          <RegisterComponent changeStatus={this.changeStatus} />
        )}
      </>
    );
  }
}

export default LoginComponent;

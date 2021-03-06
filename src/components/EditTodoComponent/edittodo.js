import React from "react";
import { Button, TextField } from "@material-ui/core";
import AddBoxIcon from "@material-ui/icons/AddBox";
import CircularProgress from "@material-ui/core/CircularProgress";
import Tasks from "./tasks.js";
import EditDialog from "./editdialog";
import DeleteListDialog from "./deletelistdialog";
import "./index.css";
import api from "../../services/api";

class EditTodoPage extends React.Component {
  state = {
    list: {},
    tasks: {},
    tasksToSend: [],
    isChangesExist: false,
    editingTitle: "",
    newTaskText: "",
    isLoading: true,
    editMode: false,
    deleteWarn: false,
  };

  editing = {};

  openDeleteWarn = () => {
    this.setState({ deleteWarn: true });
  };

  closeDeleteWarn = () => {
    this.setState({ deleteWarn: false });
  };

  editTitle = (title) => {
    if (this.state.list.title === title) {
      this.setState({
        editingTitle: "",
        isChangesExist: this.checkIsChangesExist(""),
      });
    } else {
      this.setState({
        editingTitle: title,
        isChangesExist: this.checkIsChangesExist(title),
      });
    }
  };

  checkIsChangesExist = (editingTitle) => {
    return Object.values(this.editing).length > 0 || editingTitle !== "";
  };

  editTask = (_id, { text, checked }) => {
    let task = this.editing[_id];
    if (!task) {
      task = this.editing[_id] = {
        _id,
      };
    }
    const { tasks } = this.state;
    const originalTask = tasks.find((element) => element._id === _id);
    if (text !== undefined) {
      task.text = text;
    } else {
      task.checked = checked;
    }
    if (task.text === originalTask.text) {
      delete task.text;
    }
    if (task.checked === originalTask.checked) {
      delete task.checked;
    }
    if (task.text === undefined && task.checked === undefined) {
      delete this.editing[_id];
    }
    this.setState({
      isChangesExist: this.checkIsChangesExist(this.state.editingTitle),
    });
  };

  componentDidMount = () => {
    this.getTodoList();
  };

  saveChanges = async () => {
    const { editingTitle } = this.state;
    const editing = this.editing;
    const listId = this.props.match.params.id;
    const changes = {};
    if (editingTitle !== "") {
      changes.editingTitle = editingTitle;
    }
    if (Object.values(editing).length > 0) {
      changes.editing = editing;
    }

    try {
      const res = await api().put("/api/editlist/" + listId, changes);
      if (res.status !== 201) {
        throw new Error(res.status);
      }
    } catch (e) {
      console.log(e);
    }
    this.getTodoList();
    this.setState({ editMode: false });
  };

  getTodoList = async () => {
    try {
      const listId = this.props.match.params.id;
      const res = await api().get("/api/editlist/" + listId);
      this.setState({ list: res.data.list, tasks: res.data.tasks });
    } catch (e) {
      console.error(e);
    }
    this.setState({ isLoading: false });
  };

  deleteList = async () => {
    const listId = this.props.match.params.id;
    try {
      await api().delete("/api/editlist/" + listId);
      this.props.getTodoTitles();
      this.props.history.push("/todo");
    } catch (e) {
      console.error(e);
    }
  };

  deleteTask = async (id) => {
    try {
      await api().delete("/api/deletetask/" + id);
      this.getTodoList();
    } catch (e) {
      console.error(e);
    }
  };

  changeNewTaskText = (event) => {
    this.setState({ newTaskText: event.target.value });
  };

  activateEditMode = () => {
    this.setState({ editMode: !this.state.editMode });
  };

  closeEditMode = () => {
    this.setState({ editMode: false });
  };

  saveTask = async (text) => {
    const { id } = this.props.match.params;
    try {
      await api().post("/api/tasks", {
        id_list: id,
        text,
        checked: false,
      });
      await this.getTodoList();
      this.setState({ newTaskText: "" });
    } catch (e) {
      console.log(e);
    }
  };

  addNewTaskOnEnter = (event) => {
    if (event.key === "Enter") {
      const value = event.target.value.trim();
      this.saveTask(value);
    }
  };

  addNewTaskOnClick = () => {
    this.saveTask(this.state.newTaskText.trim());
  };

  addNewTaskOnBlur = (event) => {
    const value = event.target.value.trim();
      this.saveTask(value);
  }

  handleCheck = (id) => {
    this.setState((state) => ({
      tasks: state.tasks.map((task) =>
        task._id === id ? { ...task, checked: !task.checked } : task
      ),
    }));
  };

  render() {
    if (this.state.isLoading === true) {
      return (
        <div className="main">
          <div className="container">
            <div className="content">
              <div className="main-box">
                <CircularProgress />
              </div>
            </div>
          </div>
        </div>
      );
    }
    const {
      deleteWarn,
      editMode,
      tasks,
      list: { title },
    } = this.state;
    return (
      <div>
        <h1 className="list-title">{title}</h1>
        <div className="main">
          <div className="container">
            <div className="content">
              <div className="edit-container">
                <div className="input-title"></div>

                <div className="buttons">
                  <Button className="btn" onClick={this.activateEditMode}>
                    Edit
                  </Button>
                  <Button
                    className="btn deletelist-btn"
                    onClick={() => this.openDeleteWarn()}
                  >
                    Delete
                  </Button>
                </div>

                <Tasks
                  handleCheck={this.handleCheck}
                  deleteTask={this.deleteTask}
                  editMode={editMode}
                  changeTaskChecked={this.changeTaskChecked}
                  changeTaskText={this.changeTaskText}
                  tasks={tasks}
                />
                <div className="new-task">
                  <TextField
                    onChange={this.changeNewTaskText}
                    value={this.state.newTaskText}
                    onKeyDown={this.addNewTaskOnEnter}
                    onBlur={this.addNewTaskOnBlur}
                  />
                  <div className="newtask-btn" onClick={this.addNewTaskOnClick}>
                    <AddBoxIcon />
                  </div>
                </div>
                <EditDialog
                  activateEditMode={this.activateEditMode}
                  open={this.state.editMode}
                  editTask={this.editTask}
                  editTitle={this.editTitle}
                  saveChanges={this.saveChanges}
                  isChangesExist={this.state.isChangesExist}
                  title={title}
                  tasks={tasks}
                />
                <DeleteListDialog
                  closeDeleteWarn={this.closeDeleteWarn}
                  deleteWarn={deleteWarn}
                  title={title}
                  deleteList={this.deleteList}
                />
                <div className="save-btn-container">
                  <Button
                    className="btn cancel-btn"
                    onClick={() => this.props.history.push("/todo")}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EditTodoPage;

import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
import { TODO_LIST_ABI, TODO_LIST_ADDRESS } from './config'
import TodoList from './TodoList'

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")

    //Fetch Account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    //instantiate the smart contract with the ABI and the   and store the result to the component state.
    const todoList = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS)
    this.setState({ todoList })

    //  fetch the total number of tasks in the todo list and store it to the component state.
    //the only way to return all the tasks is to fetch them one by one
    const taskCount = await todoList.methods.taskCount().call()
    this.setState({ taskCount })
    for (var i = 1; i <= taskCount; i++) {
      const task = await todoList.methods.tasks(i).call()
      this.setState({
        tasks: [...this.state.tasks, task]
      })
    }
  
}

constructor(props) {
  super(props)
  this.state = {
    account: '',
    taskCount: 0,
    tasks: [],
    loading:true
  }
  this.createTask = this.createTask.bind(this)
  this.toggleCompleted = this.toggleCompleted.bind(this)
}

//create tasks
createTask(content) {
  this.setState({ loading: true })
  this.state.todoList.methods.createTask(content).send({ from: this.state.account })
  .once('receipt', (receipt) => {
    this.setState({ loading: false })
})
}

toggleCompleted(taskId) {
  this.setState({ loading: true })
  this.state.todoList.methods.toggleCompleted(taskId).send({ from: this.state.account })
  .once('receipt', (receipt) => {
    this.setState({ loading: false })
  })
}



render() {
  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="" target="_blank">Realyt | Todo List</a>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small><a className="nav-link" href="#"><span id="account"></span></a></small>
          </li>
        </ul>
      </nav>
      <div className="container-fluid">
        <div className="row">
        <main role="main" className="col-lg-12 d-flex justify-content-center">
          { this.state.loading ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>  : <TodoList tasks={this.state.tasks} createTask={this.createTask} /> }
        </main>
        </div>
      </div>
    </div>
  );
}
}
export default App;
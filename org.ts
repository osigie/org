class EmployeeOrgApp implements IEmployeeOrgApp {
  ceo: Employee;
  history: Employee[] = []; // array to store history of moves
  currentMove = -1; // current position in history

  constructor(ceo: Employee) {
    this.ceo = ceo;
  }

  
  // function to create a deep copy of an employee
  copyEmployee(employee: Employee): Employee {
    const copy = { ...employee };
    copy.subordinates = employee.subordinates.map((e) => this.copyEmployee(e));
    return copy;
  }

  move(employeeID: number, supervisorID: number): void {
    // find the employee and supervisor
    const employee = this.findEmployeeById(employeeID, this.ceo);
    const supervisor = this.findEmployeeById(supervisorID, this.ceo);

    // check if employee and supervisor exist
    if (!employee || !supervisor) {
      throw new Error("Employee or supervisor does not exist");
    }

    // remove employee from current supervisor's subordinates
    const currentSupervisor = this.findSupervisorById(employeeID, this.ceo);
    currentSupervisor.subordinates = currentSupervisor.subordinates.filter(
      (e) => e.uniqueId !== employeeID
    );

    // add employee to new supervisor's subordinates
    supervisor.subordinates.push(employee);

    // add current state to history
    this.history.push(this.copyEmployee(this.ceo));
    this.currentMove++;
  }

  undo(): void {
    if (this.currentMove < 0) {
      throw new Error("No move to undo");
    }
    this.ceo = this.history[this.currentMove--];
  }

  redo(): void {
    if (this.currentMove >= this.history.length - 1) {
      throw new Error("No move to redo");
    }
    this.ceo = this.history[++this.currentMove];
  }

  // helper function to find an employee by their uniqueId
  findEmployeeById(id: number, employee: Employee): Employee | undefined {
    if (employee.uniqueId === id) {
      return employee;
    }
    for (const subordinate of employee.subordinates) {
      const found = this.findEmployeeById(id, subordinate);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  // function to find an employee's supervisor by their uniqueId
  findSupervisorById(id: number, employee: Employee): Employee {
    for (const subordinate of employee.subordinates) {
      if (subordinate.uniqueId === id) {
        return employee;
      }
      const found = this.findSupervisorById(id, subordinate);
      if (found) {
        return found;
      }
    }
    throw new Error("Employee not found");
  }

}


interface IEmployeeOrgApp {
  move:(employeeID: number, supervisorID: number)=>void
  undo:()=>void
  redo:()=>void
  findSupervisorById:(id: number, employee: Employee)=>Employee
  copyEmployee:(employee: Employee)=>Employee
   findEmployeeById:(id: number, employee: Employee)=> Employee | undefined 
}

interface Employee {
uniqueId: number
name: string
subordinates: Employee[]
}


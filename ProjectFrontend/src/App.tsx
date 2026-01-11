import { Route, Routes } from 'react-router-dom'
import './App.css'
import { UserProvider } from './context/useAuth'
import Navbar from './components/Layout/Navbar/Navbar'
import Login from './components/Auth/Login/Login'
import Register from './components/Auth/Register/Register'
import AdminRoute from './helpers/AdminRoute'
import ProtectedRoute from './helpers/ProtectedRoute'
import ListBankAccounts from './components/Admin/BankAccounts/ListBankAccounts/ListBankAccounts'
import ListCards from './components/Admin/Cards/ListCards/ListCards'
import ListUsers from './components/Admin/Users/ListUsers/ListUsers'
import ListTransactions from './components/Admin/Transactions/ListTransactions/ListTransactions'
import ListLoans from './components/Admin/Loans/ListLoans/ListLoans'
import Dashboard from './components/Customer/Dashboard/Dashboard'
import { ToastContainer } from 'react-toastify'
import BankAccountOverview from './components/Customer/BankAccountOverview/BankAccountOverview'
import CreateCard from './components/Admin/Cards/CreateCard/CreateCard'
import UpdateCard from './components/Admin/Cards/UpdateCard/UpdateCard'
import CreateBankAccount from './components/Admin/BankAccounts/CreateBankAccount/CreateBankAccount'
import UpdateBankAccount from './components/Admin/BankAccounts/UpdateBankAccount/UpdateBankAccount'
import UpdateUser from './components/Admin/Users/UpdateUser/UpdateUser'
import Landing from './components/Landing/Landing'

function App() {
  return (
    <>
      <ToastContainer />
      <UserProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/" element={<Landing/>}/>
          
          {/* Protected routes for authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/account/:id" element={<BankAccountOverview/>}/>
          </Route>

          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/bank-accounts" element={<ListBankAccounts/>}/>
            <Route path="/admin/bank-accounts/create" element={<CreateBankAccount/>}/>
            <Route path="/admin/bank-accounts/edit/:id" element={<UpdateBankAccount/>}/>

            <Route path="/admin/cards" element={<ListCards/>}/>
            <Route path="/admin/cards/create" element={<CreateCard/>}/>
            <Route path="/admin/cards/edit/:id" element={<UpdateCard/>}/>

            <Route path="/admin/users" element={<ListUsers/>}/>
            <Route path="/admin/users/edit/:id" element={<UpdateUser/>}/>

            <Route path="/admin/transactions" element={<ListTransactions/>}/>
            <Route path="/admin/loans" element={<ListLoans/>}/>
          </Route>
        </Routes>
      </UserProvider>
    </>
  )
}

export default App

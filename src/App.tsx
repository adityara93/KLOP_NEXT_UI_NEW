import { Navigate, Route, Routes } from 'react-router';
import { PortalLayout } from './components/layout/PortalLayout';
import { NotImplemented } from './features/NotImplemented';
import { routes } from './app/router/routes';
export default function App() { return <Routes><Route element={<PortalLayout/>}><Route index element={<Navigate to='/dashboard' replace/>}/>{routes.map((r) => <Route key={r.path} path={r.path} element={<NotImplemented title={r.label}/>}/>)}</Route><Route path='*' element={<NotImplemented title='Route not found'/>}/></Routes>; }

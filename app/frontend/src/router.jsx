import { createBrowserRouter, Navigate } from 'react-router-dom'
import FilePage from './pages/FilePage'
import UploadPage from './pages/UploadPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/upload" replace />,
  },
  {
    path: '/upload',
    element: <UploadPage />,
  },
  {
    path: '/file/:public_id',
    element: <FilePage />,
  },
])

export default router

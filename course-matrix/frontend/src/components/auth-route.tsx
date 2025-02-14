import { useGetSessionQuery } from '@/api/authApiSlice';
import {Navigate} from 'react-router-dom'
import LoadingPage from '@/pages/Loading/LoadingPage';

interface AuthRouteProps {
    component: React.ComponentType; // Type for the component prop
}

const AuthRoute: React.FC<AuthRouteProps> = ({component: Component}) => {
    const {data, isLoading, error} = useGetSessionQuery()

    if (isLoading) {
        return <LoadingPage />
    }

    // TODO modify check based on return type of data
    return data?.user ? <Component/> : <Navigate to='/login' replace/> 
}

export default AuthRoute
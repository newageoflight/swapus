import React from 'react'
import { Redirect, Route, RouteProps } from "react-router";

// also provisions for paths that are restricted-access for certain users
export interface ProtectedRouteProps extends RouteProps {
    isAuthenticated: boolean;
    isAllowed: boolean;
    restrictedPath: string;
    authenticationPath: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = props => {
    let redirectPath = '';

    if (!props.isAuthenticated)
        redirectPath = props.authenticationPath;

    if (!props.isAuthenticated && !props.isAllowed)
        redirectPath = props.restrictedPath;

    if (redirectPath) {
        const renderComponent = () => <Redirect to={{ pathname: redirectPath }} />
        return <Route {...props} component={renderComponent} render={undefined} />
    } else {
        return <Route {...props} />
    }
}

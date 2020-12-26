import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

export const FormError: React.FC = ({children}) => {
    return (
        <p className="form-error">
            <FontAwesomeIcon icon={faTimesCircle} />
            {children}
        </p>
    )
}

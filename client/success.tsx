
import { useEffect } from 'react';


function SuccessPage() {
    useEffect(() => {
        window.close();
    }, []);

    return (
        <div>
            <p>Authentication successful. This window will close automatically.</p>
        </div>
    );
}

export default SuccessPage;

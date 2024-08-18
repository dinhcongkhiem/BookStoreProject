import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div>
            <Button variant="contained">Hello world</Button>
            <h2>Home</h2>
            <Link to="/login">
                <Button variant="contained">Login</Button>
            </Link>
        </div>
    );
}

export default Home;

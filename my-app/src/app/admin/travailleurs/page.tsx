import Travailleurs from '@/components/admin/Travailleurs';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Travailleurs | Dashboard',
};

const TravailleursPage = () => {
    return <Travailleurs />;
};

export default TravailleursPage;

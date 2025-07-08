import { createClient } from '../../utils/supabase/server';
import NavBar from '../../components/NavBar';

export default async function Notes() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from("test").select();

  return (
    <div>
      <NavBar />
      <pre>{JSON.stringify(notes, null, 2)}</pre>
    </div>
  );
}
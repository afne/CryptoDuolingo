import { createClient } from '../../utils/supabase/server';
import NavBar from '../../components/NavBar';

export default async function Notes() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from("test").select();

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="pl-64 p-8">
        <div className="bg-gray-100 rounded-2xl p-8 border border-gray-200 text-blue-600">
          <h2 className="text-2xl font-bold mb-4">My Notes</h2>
          <pre className="text-black">{JSON.stringify(notes, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
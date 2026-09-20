const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
  try {
    setUploading(true);
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}-${Math.random()}.${fileExt}`;

    // (supabaseClient as any) tvingar TypeScript att godkänna anropet
    const { error: uploadError } = await (supabaseClient as any).storage
      .from('avatars')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;

    // Samma sak för getPublicUrl
    const { data } = (supabaseClient as any).storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', user.id);
      
    if (updateError) throw updateError;

    setProfile({ ...profile, avatar_url: data.publicUrl });
  } catch (error) {
    console.error('Fel vid uppladdning:', error);
    alert('Kunde inte ladda upp bilden.');
  } finally {
    setUploading(false);
  }
};
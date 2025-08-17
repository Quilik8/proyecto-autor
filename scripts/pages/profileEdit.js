// --- Página de Editar Perfil ---
import { clienteSupabase } from '../supabaseClient.js';

export const inicializarPaginaEditarPerfil = async () => {
    const editProfileForm = document.getElementById('edit-profile-form');
    if (!editProfileForm) return;

    const PREDEFINED_ROLES = ['Autor', 'Lector', 'Editor', 'Diseñador', 'Traductor', 'Beta-Reader', 'Crítico'];
    const usernameInput = document.getElementById('username-input');
    const bioInput = document.getElementById('bio-input');
    const rolesContainer = document.getElementById('predefined-roles-container');
    const customRolesInput = document.getElementById('custom-roles-input');
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarInput = document.getElementById('avatar-input');
    const errorDiv = document.getElementById('edit-profile-error');
    const submitButton = editProfileForm.querySelector('button[type="submit"]');
    let newAvatarFile = null;

    rolesContainer.innerHTML = '';
    PREDEFINED_ROLES.forEach(role => {
        const id = `role-${role.toLowerCase().replace(/\s/g, '-')}`;
        rolesContainer.insertAdjacentHTML('beforeend', `
            <div class="role-checkbox-item">
                <input type="checkbox" id="${id}" name="predefined_roles" value="${role}">
                <label for="${id}">${role}</label>
            </div>
        `);
    });

    const { data: { session } } = await clienteSupabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    const user = session.user;

    try {
        const { data: profile, error } = await clienteSupabase.from('profiles').select('username, bio, avatar_url, roles').eq('id', user.id).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (profile) {
            usernameInput.value = profile.username || '';
            bioInput.value = profile.bio || '';
            avatarPreview.src = profile.avatar_url || 'https://placehold.co/150x150/80E9D9/1a1a1a?text=Avatar';
            if (profile.roles && profile.roles.length > 0) {
                const customRoles = [];
                profile.roles.forEach(role => {
                    const checkbox = document.querySelector(`input[value="${role}"]`);
                    if (checkbox) checkbox.checked = true;
                    else customRoles.push(role);
                });
                customRolesInput.value = customRoles.join(', ');
            }
        }
    } catch (error) {
        errorDiv.textContent = `Error al cargar el perfil: ${error.message}`;
    }

    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (file) {
            newAvatarFile = file;
            const reader = new FileReader();
            reader.onload = (e) => { avatarPreview.src = e.target.result; };
            reader.readAsDataURL(file);
        }
    });

    editProfileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Guardando...';
        errorDiv.textContent = '';
        try {
            const selectedRoles = Array.from(document.querySelectorAll('input[name="predefined_roles"]:checked')).map(cb => cb.value);
            const customRoles = customRolesInput.value.split(',').map(r => r.trim()).filter(r => r);
            const allRoles = [...new Set([...selectedRoles, ...customRoles])];
            const profileUpdates = { username: usernameInput.value, bio: bioInput.value, roles: allRoles };
            if (newAvatarFile) {
                const fileExt = newAvatarFile.name.split('.').pop();
                const filePath = `${user.id}/avatar.${fileExt}`;
                await clienteSupabase.storage.from('avatars').update(filePath, newAvatarFile, { upsert: true });
                const { data: urlData } = clienteSupabase.storage.from('avatars').getPublicUrl(filePath);
                profileUpdates.avatar_url = urlData.publicUrl + `?t=${new Date().getTime()}`;
            }
            const { error: updateError } = await clienteSupabase.from('profiles').update(profileUpdates).eq('id', user.id);
            if (updateError) throw updateError;
            alert('¡Perfil actualizado con éxito!');
            window.location.href = 'perfil.html';
        } catch (error) {
            errorDiv.textContent = `Error al guardar los cambios: ${error.message}`;
            submitButton.disabled = false;
            submitButton.textContent = 'Guardar Cambios';
        }
    });
};
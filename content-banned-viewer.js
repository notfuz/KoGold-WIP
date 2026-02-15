(function () {
  'use strict';

  let panelCreated = false;

  const createBannedViewerPanel = () => {
    if (panelCreated) {
      const existing = document.getElementById('kogold-banned-viewer');
      if (existing) existing.style.display = 'block';
      return;
    }

    const panel = document.createElement('div');
    panel.id = 'kogold-banned-viewer';
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      max-height: 85vh;
      background: #222222ff;
      border: 2px solid #555555;
      padding: 0;
      z-index: 10000;
      font-family: Arial, sans-serif;
      color: #e0e0e0;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `;

    // Title bar
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
      background: #333333;
      color: #ffd166;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #555555;
      flex-shrink: 0;
      font-weight: bold;
    `;
    titleBar.textContent = 'Account Viewer';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = `
      background: #333333;
      border: 2px solid #555555;
      color: #ffd166;
      font-weight: bold;
      font-size: 11px;
      cursor: pointer;
      padding: 4px 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.addEventListener('mousedown', () => {
      closeBtn.style.borderStyle = '2px solid #555555';
    });
    closeBtn.addEventListener('mouseup', () => {
      closeBtn.style.borderStyle = '2px solid #555555';
    });
    closeBtn.addEventListener('click', () => {
      panel.style.display = 'none';
    });
    titleBar.appendChild(closeBtn);
    panel.appendChild(titleBar);

    // Content area
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 16px;
      overflow-y: auto;
      flex: 1;
      background: #2a2a2a;
    `;

    // Input section
    const inputGroup = document.createElement('div');
    inputGroup.style.cssText = `
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter user ID';
    input.style.cssText = `
      flex: 1;
      padding: 8px 12px;
      background: #333333;
      border: 2px solid #555555;
      color: #e0e0e0;
      border-radius: 0px;
      font-size: 13px;
      outline: none;
      font-family: Arial, sans-serif;
    `;
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkBtn.click();
    });

    const checkBtn = document.createElement('button');
    checkBtn.textContent = 'Check';
    checkBtn.style.cssText = `
      padding: 8px 16px;
      background: #333333;
      color: #ffd166;
      border: 2px solid #555555;
      border-radius: 0px;
      cursor: pointer;
      font-weight: bold;
      font-size: 13px;
      font-family: Arial, sans-serif;
    `;
    checkBtn.addEventListener('mousedown', () => {
      checkBtn.style.borderStyle = 'solid';
    });
    checkBtn.addEventListener('mouseup', () => {
      checkBtn.style.borderStyle = 'solid';
    });
    checkBtn.addEventListener('mouseover', () => {
      checkBtn.style.background = '#444444';
    });
    checkBtn.addEventListener('mouseout', () => {
      checkBtn.style.background = '#333333';
    });

    const results = document.createElement('div');
    results.id = 'kogold-ban-results';
    results.style.cssText = `
      background: #3a3a3a;
      border: 2px solid #555555;
      padding: 16px;
      font-size: 13px;
      color: #e0e0e0;
      min-height: 100px;
      border-radius: 0px;
    `;
    results.textContent = 'Enter a user ID and click Check';

    checkBtn.addEventListener('click', async () => {
      const userId = input.value.trim();
      if (!userId) {
        results.style.color = '#ff6b6b';
        results.textContent = 'Please enter a user ID';
        return;
      }

      if (!/^\d+$/.test(userId)) {
        results.style.color = '#ff6b6b';
        results.textContent = 'User ID must be a number';
        return;
      }

      results.style.color = '#e0e0e0';
      results.textContent = 'Checking...';
      checkBtn.disabled = true;
      checkBtn.style.opacity = '0.6';

      try {
        const userData = await checkBanStatus(userId);
        displayProfile(results, userData);
      } catch (error) {
        results.style.color = '#ff6b6b';
        results.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 8px;">Error:</div>
          <div>${error.message}</div>
        `;
        console.error('Ban check error:', error);
      } finally {
        checkBtn.disabled = false;
        checkBtn.style.opacity = '1';
      }
    });

    inputGroup.appendChild(input);
    inputGroup.appendChild(checkBtn);
    content.appendChild(inputGroup);
    content.appendChild(results);
    panel.appendChild(content);

    document.body.appendChild(panel);
    panelCreated = true;
  };

  const checkBanStatus = async (userId) => {
    try {
      // Fetch main user data
      const userResponse = await fetch(`https://www.pekora.zip/apisite/users/v1/users/${userId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!userResponse.ok) {
        return { 
          isBanned: true,
          userId: userId,
          username: 'Unknown',
          avatar: null
        };
      }

      const userData = await userResponse.json();

      // Fetch avatar thumbnail
      let avatar = null;
      try {
        const avatarResponse = await fetch(`https://www.pekora.zip/apisite/thumbnails/v1/users/avatar-headshot?userIds=${userId}%2C${userId}&size=420x420&format=png`, {
          method: 'GET',
          credentials: 'include'
        });
        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          console.log('Full Avatar API response:', avatarData);
          console.log('Response type:', typeof avatarData);
          console.log('Response keys:', Object.keys(avatarData));
          
          // Recursively search for imageUrl in the response
          const findImageUrl = (obj) => {
            if (!obj) return null;
            
            if (typeof obj === 'string' && obj.includes('_headshot.png')) {
              return obj.startsWith('http') ? obj : `https://www.pekora.zip${obj}`;
            }
            
            if (obj.imageUrl) {
              return obj.imageUrl.startsWith('http') ? obj.imageUrl : `https://www.pekora.zip${obj.imageUrl}`;
            }
            
            for (const key in obj) {
              if (typeof obj[key] === 'object') {
                const result = findImageUrl(obj[key]);
                if (result) return result;
              }
            }
            
            return null;
          };
          
          avatar = findImageUrl(avatarData);
          console.log('Final Avatar URL:', avatar);
        }
      } catch (e) {
        console.log('Avatar fetch error:', e);
      }

      // Fetch followers count
      let followers = 0;
      try {
        const followersResponse = await fetch(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/followers/count`, {
          method: 'GET',
          credentials: 'include'
        });
        if (followersResponse.ok) {
          const followersData = await followersResponse.json();
          followers = followersData.count || 0;
        }
      } catch (e) {
        console.log('Followers fetch failed');
      }

      // Fetch followings count
      let following = 0;
      try {
        const followingResponse = await fetch(`https://www.pekora.zip/apisite/friends/v1/users/${userId}/followings/count`, {
          method: 'GET',
          credentials: 'include'
        });
        if (followingResponse.ok) {
          const followingData = await followingResponse.json();
          following = followingData.count || 0;
        }
      } catch (e) {
        console.log('Following fetch failed');
      }

      return {
        isBanned: userData.isBanned === true || userData.banned === true || userData.status === 'banned' || false,
        userId: userId,
        username: userData.username || userData.name || 'Unknown',
        avatar: avatar,
        status: userData.status || 'Unknown',
        description: userData.description || userData.about || '',
        friends: userData.friends || 0,
        followers: followers,
        following: following,
        rap: userData.rap || userData.RAP || 0,
        joinDate: userData.joinDate || null,
        socialLinks: userData.socialLinks || {}
      };
    } catch (error) {
      throw new Error('Failed to fetch user data: ' + error.message);
    }
  };

  const displayProfile = (container, userData) => {
    container.innerHTML = '';
    container.style.color = '#e0e0e0';

    const profileCard = document.createElement('div');
    profileCard.style.cssText = `
      background: #3a3a3a;
      border: 2px solid #555555;
      padding: 16px;
    `;

    // Header section with avatar and username
    const headerRow = document.createElement('div');
    headerRow.style.cssText = `
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      align-items: flex-start;
    `;

    // Avatar
    const avatarContainer = document.createElement('div');
    avatarContainer.style.cssText = `
      flex-shrink: 0;
    `;
    const avatarImg = document.createElement('img');
    avatarImg.style.cssText = `
      width: 80px;
      height: 80px;
      background: #555555;
      border: 2px solid #555555;
    `;
    if (userData.avatar) {
      avatarImg.src = userData.avatar;
    } else {
      avatarImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23555555"/%3E%3Ctext x="50" y="50" font-size="40" fill="%23999" text-anchor="middle" dy=".3em"%3E?%3C/text%3E%3C/svg%3E';
    }
    avatarContainer.appendChild(avatarImg);
    headerRow.appendChild(avatarContainer);

    // Info section
    const infoSection = document.createElement('div');
    infoSection.style.cssText = `
      flex: 1;
    `;

    const username = document.createElement('h3');
    username.textContent = userData.username;
    username.style.cssText = `
      margin: 0 0 4px 0;
      font-size: 18px;
      color: #ffd166;
    `;
    infoSection.appendChild(username);

    const statusBadge = document.createElement('div');
    statusBadge.style.cssText = `
      display: inline-block;
      padding: 4px 8px;
      border-radius: 0px;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 8px;
      border: 2px solid;
    `;
    if (userData.isBanned) {
      statusBadge.style.background = '#333333';
      statusBadge.style.color = '#ff6b6b';
      statusBadge.style.borderColor = '#ff6b6b';
      statusBadge.textContent = 'BANNED';
    } else {
      statusBadge.style.background = '#333333';
      statusBadge.style.color = '#02b757';
      statusBadge.style.borderColor = '#02b757';
      statusBadge.textContent = 'ACTIVE';
    }
    infoSection.appendChild(statusBadge);

    // Stats
    const statsRow = document.createElement('div');
    statsRow.style.cssText = `
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 8px;
    `;

    const statItems = [
      { label: 'Friends', value: userData.friends },
      { label: 'Followers', value: userData.followers },
      { label: 'Following', value: userData.following },
      { label: 'RAP', value: userData.rap || '0' }
    ];

    statItems.forEach(stat => {
      const statBox = document.createElement('div');
      statBox.style.cssText = `
        background: #2a2a2a;
        padding: 6px;
        border-radius: 0px;
        text-align: center;
        border: 2px solid #555555;
      `;
      const label = document.createElement('div');
      label.textContent = stat.label;
      label.style.cssText = `
        font-size: 11px;
        color: #999;
        margin-bottom: 2px;
      `;
      const value = document.createElement('div');
      value.textContent = stat.value;
      value.style.cssText = `
        font-weight: bold;
        color: #ffd166;
      `;
      statBox.appendChild(label);
      statBox.appendChild(value);
      statsRow.appendChild(statBox);
    });
    infoSection.appendChild(statsRow);

    headerRow.appendChild(infoSection);
    profileCard.appendChild(headerRow);

    // Description/About
    if (userData.description && userData.description.trim()) {
      const aboutSection = document.createElement('div');
      aboutSection.style.cssText = `
        margin-top: 12px;
        padding-top: 12px;
        border-top: 2px solid #555555;
      `;
      const aboutLabel = document.createElement('div');
      aboutLabel.textContent = 'About';
      aboutLabel.style.cssText = `
        font-weight: bold;
        margin-bottom: 6px;
        color: #ffd166;
        font-size: 12px;
      `;
      aboutSection.appendChild(aboutLabel);
      const aboutText = document.createElement('p');
      aboutText.textContent = userData.description.substring(0, 300);
      aboutText.style.cssText = `
        margin: 0;
        font-size: 12px;
        color: #bbb;
        line-height: 1.4;
        white-space: pre-wrap;
        word-wrap: break-word;
      `;
      aboutSection.appendChild(aboutText);
      profileCard.appendChild(aboutSection);
    }

    // Join date
    if (userData.joinDate) {
      const joinSection = document.createElement('div');
      joinSection.style.cssText = `
        margin-top: 12px;
        padding-top: 12px;
        border-top: 2px solid #555555;
        font-size: 12px;
        color: #999;
      `;
      joinSection.innerHTML = `<span style="font-weight: bold; color: #ffd166;">Joined:</span> ${userData.joinDate}`;
      profileCard.appendChild(joinSection);
    }

    // Profile link
    const linkSection = document.createElement('div');
    linkSection.style.cssText = `
      margin-top: 12px;
      padding-top: 12px;
      border-top: 2px solid #555555;
    `;
    const link = document.createElement('a');
    link.href = `/User.aspx?ID=${userData.userId}`;
    link.target = '_blank';
    link.textContent = 'View Full Profile →';
    link.style.cssText = `
      color: #ffd166;
      text-decoration: none;
      font-weight: bold;
      font-size: 12px;
    `;
    link.addEventListener('mouseover', () => {
      link.style.color = '#ffdd99';
    });
    link.addEventListener('mouseout', () => {
      link.style.color = '#ffd166';
    });
    linkSection.appendChild(link);
    profileCard.appendChild(linkSection);

    container.appendChild(profileCard);
  };

  window.KoGold_openBannedViewer = () => {
    createBannedViewerPanel();
  };
})();

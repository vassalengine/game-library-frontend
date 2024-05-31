<script>
  export let ums_url;
  export let username;
  export let size;
</script>

<style>

.avatar {
  border-radius: 50%;
}

</style>

<a href={`${ums_url}/users/${username}`}><img class="avatar" width={size} height={size} loading="lazy" src={`${ums_url}/users/${username}/avatar/${size}`} alt="">{username}</a>

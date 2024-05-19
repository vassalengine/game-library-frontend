<script>
  export let UMS_URL;
  export let username;
  export let size;
</script>

<style>

.avatar {
  border-radius: 50%;
}

</style>

<a href={`${UMS_URL}/users/${username}`}><img class="avatar" width={size} height={size} loading="lazy" src={`${UMS_URL}/users/${username}/avatar/${size}`} alt="">{username}</a>

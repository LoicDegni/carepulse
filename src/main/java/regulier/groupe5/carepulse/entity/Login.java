package regulier.groupe5.carepulse.entity;

import jakarta.validation.constraints.NotBlank;

public class Login {
    @NotBlank
    private String username;

    @NotBlank
    private String pwd;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPwd() { return pwd; }
    public void setPwd(String pwd) { this.pwd = pwd; }
}

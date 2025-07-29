package com.clipnest.messaging.service;

import com.clipnest.messaging.dto.AuthRequest;
import com.clipnest.messaging.dto.AuthResponse;
import com.clipnest.messaging.dto.RegisterRequest;
import com.clipnest.messaging.dto.UserDto;
import com.clipnest.messaging.entity.RefreshToken;
import com.clipnest.messaging.entity.User;
import com.clipnest.messaging.exception.BadRequestException;
import com.clipnest.messaging.exception.ResourceNotFoundException;
import com.clipnest.messaging.repository.RefreshTokenRepository;
import com.clipnest.messaging.repository.UserRepository;
import com.clipnest.messaging.security.JwtUtils;
import com.clipnest.messaging.security.UserPrincipal;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ModelMapper modelMapper;

    @Value("${app.jwt.refresh-expiration}")
    private int refreshExpirationMs;

    public AuthResponse login(AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByUsername(userPrincipal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Generate refresh token
        String refreshToken = generateRefreshToken(user);

        UserDto userDto = modelMapper.map(user, UserDto.class);
        return new AuthResponse(jwt, refreshToken, userDto);
    }

    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());

        User savedUser = userRepository.save(user);

        // Generate tokens
        String jwt = jwtUtils.generateJwtToken(savedUser.getUsername());
        String refreshToken = generateRefreshToken(savedUser);

        UserDto userDto = modelMapper.map(savedUser, UserDto.class);
        return new AuthResponse(jwt, refreshToken, userDto);
    }

    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new BadRequestException("Refresh token expired");
        }

        String newJwt = jwtUtils.generateJwtToken(token.getUser().getUsername());
        UserDto userDto = modelMapper.map(token.getUser(), UserDto.class);

        return new AuthResponse(newJwt, refreshToken, userDto);
    }

    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(refreshTokenRepository::delete);
    }

    private String generateRefreshToken(User user) {
        // Delete existing refresh token for user
        refreshTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000);

        RefreshToken refreshToken = new RefreshToken(token, user, expiryDate);
        refreshTokenRepository.save(refreshToken);

        return token;
    }
}
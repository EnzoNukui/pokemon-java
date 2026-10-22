package br.com.fiap.to;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class PokemonTO {
    private Long codigo;
    @NotBlank
    private String nome;
    @NotNull
    @Positive
    private Double altura;
    @NotNull
    @Positive
    private Double peso;
    @NotBlank
    private String categoria;
    @PastOrPresent
    private LocalDate dataDaCaptura;

    //construtores

    public PokemonTO() {
    }

    public PokemonTO(Long codigo, String nome, Double altura, Double peso, String categoria, LocalDate dataDaCaptura) {
        this.codigo = codigo;
        this.nome = nome;
        this.altura = altura;
        this.peso = peso;
        this.categoria = categoria;
        this.dataDaCaptura = dataDaCaptura;
    }

    //getters e setters

    public Long getCodigo() {
        return this.codigo;
    }
    public void setCodigo(Long codigo) {
        this.codigo = codigo;
    }
    public String getNome() {
        return this.nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
    }
    public Double getAltura() {
        return this.altura;
    }
    public void setAltura(Double altura) {
        this.altura = altura;
    }
    public Double getPeso() {
        return this.peso;
    }
    public void setPeso(Double peso) {
        this.peso = peso;
    }
    public String getCategoria() {
        return this.categoria;
    }
    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
    public LocalDate getDataDaCaptura() {
        return this.dataDaCaptura;
    }
    public void setDataDaCaptura(LocalDate dataDaCaptura) {
        this.dataDaCaptura = dataDaCaptura;
    }
}

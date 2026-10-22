package br.com.fiap.resource;

import br.com.fiap.bo.PokemonBO;
import br.com.fiap.to.PokemonTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pokemon") //localhost:8080/pokemon
public class PokemonResource {
    private PokemonBO pokemonBO = new PokemonBO();

    @GetMapping
    public ResponseEntity<List<PokemonTO>> findAll(){
        List<PokemonTO> pokemons = pokemonBO.findAll();
        if (pokemons != null) {
            return ResponseEntity.status(HttpStatus.OK).body(pokemons);
        } else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<?> findByCodigo(@PathVariable Long codigo){
        PokemonTO pokemon = pokemonBO.findByCodigo(codigo);
        if (pokemon != null){
            return ResponseEntity.status(HttpStatus.OK).body(pokemon);
        } else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Pokemon não encontrado!");
        }
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody @Valid PokemonTO pokemon){
        try {
            PokemonTO resultado = pokemonBO.save(pokemon);

            return ResponseEntity.status(HttpStatus.CREATED).body(pokemon);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro ao salvar o pokemon");
        }
    }

    @PutMapping("/{codigo}")
    public ResponseEntity<?> update(@RequestBody @Valid PokemonTO pokemon,@PathVariable Long codigo){
        try {
            pokemon.setCodigo(codigo);
            PokemonTO resposta = pokemonBO.update(pokemon);
            return ResponseEntity.status(HttpStatus.OK).body("Pokemon atualizado com sucesso");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Não foi possivel atualizar o pokemon!");
        }
    }

    @DeleteMapping("/{codigo}")
    public ResponseEntity<String> delete(@PathVariable Long codigo){
        if (pokemonBO.delete(codigo)){
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Pokemon removido!");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Não foi possivel");
        }
    }
}
